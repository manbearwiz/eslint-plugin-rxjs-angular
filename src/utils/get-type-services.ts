import {
  ESLintUtils,
  type TSESLint,
  type TSESTree as es,
} from '@typescript-eslint/utils';
import * as tsutils from 'tsutils-etc';

export function getTypeServices<
  TMessageIds extends string,
  TOptions extends unknown[],
>(context: TSESLint.RuleContext<TMessageIds, Readonly<TOptions>>) {
  const services = ESLintUtils.getParserServices(context);
  const { esTreeNodeToTSNodeMap, program } = services;
  const typeChecker = program.getTypeChecker();

  const couldBeType = (node: es.Node, name: string | RegExp) => {
    const tsNode = esTreeNodeToTSNodeMap.get(node);
    const type = tsNode && typeChecker.getTypeAtLocation(tsNode);
    return tsutils.couldBeType(type, name);
  };

  return {
    couldBeBehaviorSubject: (node: es.Node) =>
      couldBeType(node, 'BehaviorSubject'),
    couldBeError: (node: es.Node) => couldBeType(node, 'Error'),
    couldBeMonoTypeOperatorFunction: (node: es.Node) =>
      couldBeType(node, 'MonoTypeOperatorFunction'),
    couldBeObservable: (node: es.Node) => couldBeType(node, 'Observable'),
    couldBeSubject: (node: es.Node) => couldBeType(node, 'Subject'),
    couldBeSubscription: (node: es.Node) => couldBeType(node, 'Subscription'),
  };
}
