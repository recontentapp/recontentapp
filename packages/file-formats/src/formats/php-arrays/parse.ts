import {
  Engine,
  Program,
  Node,
  ExpressionStatement,
  Assign,
  OffsetLookup,
  String as PHPString,
  Variable,
} from 'php-parser'
import { Dict, Parser } from '../../types'

// eg. $array['key'] = 'value';
interface ValidExpressionStatement extends ExpressionStatement {
  expression: Assign & {
    left: OffsetLookup & {
      what: Variable
      offset: PHPString
    }
    right: PHPString
  }
}

const isValidExpressionStatement = (
  node: Node,
): node is ValidExpressionStatement => {
  if (node.kind !== 'expressionstatement') {
    return false
  }

  const expressionStatementNode = node as ExpressionStatement
  if (expressionStatementNode.expression.kind !== 'assign') {
    return false
  }

  const assignExpression = expressionStatementNode.expression as Assign
  if (assignExpression.operator !== '=') {
    return false
  }

  if (assignExpression.left.kind !== 'offsetlookup') {
    return false
  }

  const offsetLookup = assignExpression.left as OffsetLookup
  if (offsetLookup.what.kind !== 'variable') {
    return false
  }
  if (offsetLookup.offset.kind !== 'string') {
    return false
  }

  if (assignExpression.right.kind !== 'string') {
    return false
  }

  return true
}

export const parsePHPArrays: Parser = data => {
  const parser = new Engine({
    parser: {
      extractDoc: true,
      php7: true,
    },
    ast: {
      withPositions: true,
    },
  })

  let program: Program | null = null

  try {
    // Remove PHP opening and closing tags
    const normalizedData = data
      .toString()
      .replace(/<\?php/g, '')
      .replace(/\?>/g, '')

    program = parser.parseEval(normalizedData)
  } catch (e) {
    console.log(e, program)
  }

  if (!program || program.errors.length > 0) {
    return Promise.reject(new Error('Failed to parse PHP'))
  }

  const validExpressionStatements = program.children.filter(
    isValidExpressionStatement,
  )

  const result: Dict = {}

  validExpressionStatements.forEach(statement => {
    const key = statement.expression.left.offset.value
    const value = statement.expression.right.value

    result[key] = value
  })

  return Promise.resolve(result)
}
