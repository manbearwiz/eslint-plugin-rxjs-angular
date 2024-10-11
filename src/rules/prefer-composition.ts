import { AST_NODE_TYPES, type TSESTree as es } from '@typescript-eslint/utils';
import { stripIndent } from 'common-tags';
import { getTypeServices, ruleCreator } from '../utils';

const defaultOptions: readonly {
  checkDecorators?: string[];
}[] = [];

export default ruleCreator({
  defaultOptions,
  meta: {
    docs: {
      description:
        'Forbids `subscribe` calls that are not composed within Angular components (and, optionally, within services, directives, and pipes).',
      recommended: false,
    },
    hasSuggestions: false,
    messages: {
      notComposed: 'Subscription not composed.',
      notDeclared: 'Composed subscription `{{name}}` not a class property.',
      notImplemented: '`ngOnDestroy` not implemented.',
      notUnsubscribed: 'Composed subscription not unsubscribed.',
    },
    schema: [
      {
        properties: {
          checkDecorators: { type: 'array', items: { type: 'string' } },
        },
        type: 'object',
        description: stripIndent`
        An optional object with an optional \`checkDecorators\` property.
        The \`checkDecorators\` property is an array containing the names of the decorators that determine whether or not a class is checked.
      `,
      },
    ],
    type: 'problem',
  },
  name: 'prefer-composition',
  create: (context, _unused: typeof defaultOptions) => {
    const { couldBeObservable, couldBeSubscription } = getTypeServices(context);
    const [{ checkDecorators = ['Component'] } = {}] = context.options;

    type Entry = {
      addCallExpressions: es.CallExpression[];
      classDeclaration: es.ClassDeclaration;
      propertyDefinitions: es.PropertyDefinition[];
      hasDecorator: boolean;
      ngOnDestroyDefinition?: es.MethodDefinition;
      subscribeCallExpressions: es.CallExpression[];
      subscriptions: Set<string>;
      unsubscribeCallExpressions: es.CallExpression[];
    };
    const entries: Entry[] = [];

    function checkEntry(record: Entry) {
      const {
        classDeclaration,
        propertyDefinitions,
        ngOnDestroyDefinition,
        subscribeCallExpressions,
        subscriptions,
        unsubscribeCallExpressions,
      } = record;

      if (subscribeCallExpressions.length === 0) {
        return;
      }
      subscribeCallExpressions.forEach((callExpression) => {
        const { callee } = callExpression;
        if (callee.type === AST_NODE_TYPES.MemberExpression) {
          const { object, property } = callee;
          if (!couldBeObservable(object)) {
            return;
          }
          if (isComposed(callExpression, record)) {
            return;
          }
          context.report({
            messageId: 'notComposed',
            node: property,
          });
        }
      });

      if (!ngOnDestroyDefinition) {
        context.report({
          messageId: 'notImplemented',
          node: classDeclaration.id ?? classDeclaration,
        });
        return;
      }

      subscriptions.forEach((subscription) => {
        const propertyDefinition = propertyDefinitions.find(
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (propertyDefinition: any) =>
            propertyDefinition.key.name === subscription,
        );
        if (!propertyDefinition) {
          context.report({
            data: { name: subscription },
            messageId: 'notDeclared',
            node: classDeclaration.id ?? classDeclaration,
          });
          return;
        }

        const callExpression = unsubscribeCallExpressions.find(
          (callExpression) => {
            const name = getMethodCalleeName(callExpression);
            return name === subscription;
          },
        );
        if (!callExpression) {
          context.report({
            data: { name: subscription },
            messageId: 'notUnsubscribed',
            node: propertyDefinition.key,
          });
          return;
        }
      });
    }

    function getEntry() {
      const { length, [length - 1]: entry } = entries;
      return entry;
    }

    function getMethodCalleeName(callExpression: es.CallExpression) {
      const { callee } = callExpression;
      if (callee.type === AST_NODE_TYPES.MemberExpression) {
        const { object } = callee;
        if (
          object.type === AST_NODE_TYPES.MemberExpression &&
          object.property.type === AST_NODE_TYPES.Identifier
        ) {
          return object.property.name;
        }
        if (object.type === AST_NODE_TYPES.Identifier) {
          return object.name;
        }
      }
      return undefined;
    }

    function getMethodCalleeObject(callExpression: es.CallExpression) {
      const { callee } = callExpression;
      if (callee.type === AST_NODE_TYPES.MemberExpression) {
        return callee.object;
      }
      return undefined;
    }

    function hasDecorator(node: es.ClassDeclaration) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const { decorators } = node as any;
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return decorators?.some((decorator: any) => {
        const { expression } = decorator;
        if (expression.type !== AST_NODE_TYPES.CallExpression) {
          return false;
        }
        if (expression.callee.type !== AST_NODE_TYPES.Identifier) {
          return false;
        }
        const { name } = expression.callee;
        return checkDecorators.some((check: string) => name === check);
      });
    }

    function isComposed(callExpression: es.CallExpression, entry: Entry) {
      // A call to subscribe is composed if it's directly added to a
      // subscription or if it's assigned to a variable that is added to a
      // subscription.
      const { addCallExpressions, subscriptions } = entry;
      const parent = callExpression.parent;
      if (!parent) {
        return false;
      }
      if (parent.type === AST_NODE_TYPES.CallExpression) {
        const addCallExpression = addCallExpressions.find(
          (callExpression) => callExpression === parent,
        );
        if (!addCallExpression) {
          return false;
        }
        const object = getMethodCalleeObject(addCallExpression);
        if (!object || !couldBeSubscription(object)) {
          return false;
        }
        const name = getMethodCalleeName(addCallExpression);
        if (!name) {
          return false;
        }
        subscriptions.add(name);
        return true;
      }
      if (
        parent.type === AST_NODE_TYPES.VariableDeclarator &&
        parent.id.type === AST_NODE_TYPES.Identifier
      ) {
        return isVariableComposed(parent.id, entry);
      }
      if (
        parent.type === AST_NODE_TYPES.AssignmentExpression &&
        parent.left.type === AST_NODE_TYPES.Identifier &&
        parent.operator === '='
      ) {
        return isVariableComposed(parent.left, entry);
      }
      return false;
    }

    function isVariableComposed(identifier: es.Identifier, entry: Entry) {
      // A subscription variable is composed if it's added to another
      // subscription.
      const { name } = identifier;
      const { addCallExpressions, subscriptions } = entry;
      const addCallExpression = addCallExpressions.find(
        (callExpression) => getMethodCalleeName(callExpression) === name,
      );
      if (!addCallExpression) {
        return false;
      }
      const object = getMethodCalleeObject(addCallExpression);
      if (!object || !couldBeSubscription(object)) {
        return false;
      }
      subscriptions.add(name);
      return true;
    }

    return {
      "CallExpression[callee.property.name='add']": (
        node: es.CallExpression,
      ) => {
        const entry = getEntry();
        if (entry?.hasDecorator) {
          entry.addCallExpressions.push(node);
        }
      },
      "CallExpression[callee.property.name='subscribe']": (
        node: es.CallExpression,
      ) => {
        const entry = getEntry();
        if (entry?.hasDecorator) {
          entry.subscribeCallExpressions.push(node);
        }
      },
      ClassDeclaration: (node: es.ClassDeclaration) => {
        entries.push({
          addCallExpressions: [],
          classDeclaration: node,
          propertyDefinitions: [],
          hasDecorator: hasDecorator(node),
          subscribeCallExpressions: [],
          subscriptions: new Set<string>(),
          unsubscribeCallExpressions: [],
        });
      },
      'ClassDeclaration:exit': (_node: es.ClassDeclaration) => {
        const entry = entries.pop();
        if (entry?.hasDecorator) {
          checkEntry(entry);
        }
      },
      PropertyDefinition: (node: es.PropertyDefinition) => {
        const entry = getEntry();
        if (entry?.hasDecorator) {
          entry.propertyDefinitions.push(node);
        }
      },
      "MethodDefinition[key.name='ngOnDestroy'][kind='method']": (
        node: es.MethodDefinition,
      ) => {
        const entry = getEntry();
        if (entry?.hasDecorator) {
          entry.ngOnDestroyDefinition = node;
        }
      },
      "MethodDefinition[key.name='ngOnDestroy'][kind='method'] CallExpression[callee.property.name='unsubscribe']":
        (node: es.CallExpression) => {
          const entry = getEntry();
          if (entry?.hasDecorator) {
            entry.unsubscribeCallExpressions.push(node);
          }
        },
    };
  },
});
