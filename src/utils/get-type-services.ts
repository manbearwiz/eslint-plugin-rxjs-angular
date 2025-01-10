import {
  ESLintUtils,
  type TSESLint,
  type TSESTree as es,
} from '@typescript-eslint/utils';
import ts from 'typescript';
import { isIntersectionType, isTypeReference, isUnionType } from 'ts-api-utils';

function typeCouldBeType(type: ts.Type, name: string): boolean {
  const innerType = isTypeReference(type) ? type.target : type;

  return (
    innerType.symbol?.name === name ||
    couldImplement(innerType, name) ||
    innerType.getBaseTypes()?.some((t) => typeCouldBeType(t, name)) ||
    ((isIntersectionType(innerType) || isUnionType(innerType)) &&
      innerType.types.some((t) => typeCouldBeType(t, name)))
  );
}

function couldImplement(type: ts.Type, name: string): boolean {
  const valueDeclaration = type.symbol?.valueDeclaration;
  return (
    (valueDeclaration &&
      ts.isClassDeclaration(valueDeclaration) &&
      valueDeclaration.heritageClauses?.some(
        ({ token, types }) =>
          token === ts.SyntaxKind.ImplementsKeyword &&
          types.some(({ expression }) => expression.getText() === name),
      )) ??
    false
  );
}

export function getTypeServices<
  TMessageIds extends string,
  TOptions extends unknown[],
>(context: TSESLint.RuleContext<TMessageIds, Readonly<TOptions>>) {
  const { esTreeNodeToTSNodeMap, program } =
    ESLintUtils.getParserServices(context);
  const typeChecker = program.getTypeChecker();

  const nodeCouldBeType = (node: es.Node, name: string) => {
    const tsNode = esTreeNodeToTSNodeMap.get(node);
    const type = tsNode && typeChecker.getTypeAtLocation(tsNode);
    return type ? typeCouldBeType(type, name) : false;
  };

  return {
    couldBeObservable: (node: es.Node) => nodeCouldBeType(node, 'Observable'),
    couldBeSubscription: (node: es.Node) =>
      nodeCouldBeType(node, 'Subscription'),
  };
}
