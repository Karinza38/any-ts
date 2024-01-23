export {
  assert,
  describe,
  expect,
  expectToFail,
}

import type * as any from "../any"
import { enforce, TypeError } from "../exports";

import * as Sym from "./symbol"

interface Suite {
  assert: typeof assert
}

type byPos<type extends any.array, failures extends any.object = {}, ix extends void[] = []>
  = type extends readonly [] ? [keyof failures] extends [never] ? Sym.GreenEmoji : eval<failures>
  : type extends readonly [infer head, ...infer tail]
  ? byPos<
    tail,
    [Sym.GreenEmoji] extends [head] ? failures
    : failures & { [x in `#${ix["length"]}`]: head },
    [...ix, void]
  >
  : never
  ;

type byName<type extends any.object>
  = (
    keyof type extends infer key ? key extends keyof type ? type[key] extends Sym.GreenEmoji ? never : key : never : never) extends infer key ? [key] extends [keyof type]
  ? { [k in key]: type[k] }
  //   [key] extends [keyof type]
  // ? { [ix in keyof type]: type[ix] }
  // : never
  : never
  : never
  ;

interface TestResult<type> { }

type eval<type> = never | { [ix in keyof type]: type[ix] }

declare const describe: Describe

interface Describe {
  <title extends string, const results extends any.array>(title: title, t: (suite: Suite) => results): TestResult<byPos<results>>
  <title extends string, const results extends any.object>(title: title, t: (suite: Suite) => results): TestResult<byName<results>>
  <title extends string, const result>(title: title, t: (suite: Suite) => result): TestResult<byPos<[result]>>
  <title extends string>(title: title, t: (suite: Suite) => void): void
}

type expect<type extends [type] extends [Sym.GreenEmoji] ? Sym.GreenEmoji : never> = type

declare const expect
  : {
    /** 
     * This overload is the trick to getting the type of `type` to come through
     * when in an error-state (since the first overload is meant to be unsatisfiable):
     */
    <const type>(type: type, _skip: never): [Sym.RedEmoji, type]
    <const type extends Sym.GreenEmoji>(type: type): type
  }

declare const expectToFail
  : {
    <const type>(type: type, _skip: never): [Sym.GreenEmoji] extends [type] ? TypeError<[Sym.RedEmoji, `Expected a failing test, but got a passing one instead`]> : type
    <const type extends [type] extends [Sym.GreenEmoji] ? TypeError<[Sym.RedEmoji, `Expected a failing test, but got a passing one instead`]> : unknown>(type: type): Sym.GreenEmoji
  }


declare const assert: {
  isTrue<const type>(type: type): assert.isTrue<type>
  isFalse<const type>(type: type): assert.isFalse<type>
  equal: {
    <const a, const b, fn extends Interpreter = Equal>(a: a, b: b, fn?: fn): assert.equal<a, b, fn>
    <const b>(b: b): <const a, fn extends Interpreter = Equal>(a: a, fn?: fn) => assert.equal<a, b, fn>
  }
  equivalent: {
    <const a, const b, fn extends Interpreter = Equivalent>(a: a, b: b, fn?: fn): assert.equivalent<a, b, fn>
    <const b>(b: b): <const a, fn extends Interpreter = Equivalent>(a: a, fn?: fn) => assert.equivalent<a, b, fn>
  }
  not: {
    equal: {
      <const a, const b, fn extends Interpreter = NotEqual>(a: a, b: b, fn?: fn): assert.not.equal<a, b, fn>
      <const b>(b: b): <const a, fn extends Interpreter = NotEqual>(a: a, fn?: fn) => assert.not.equal<a, b, fn>
    }
    equivalent: {
      <const a, const b, fn extends Interpreter = NotEquivalent>(a: a, b: b, fn?: fn): assert.not.equivalent<a, b, fn>
      <const b>(b: b): <const a, fn extends Interpreter = NotEquivalent>(a: a, fn?: fn) => assert.not.equivalent<a, b, fn>
    }
  }
}
declare namespace assert {
  type isTrue<type> = handleAnys<type, never, [true] extends [type] ? Sym.GreenEmoji : interpretFailure<TrueLiteral, type, never>>
  type isFalse<type> = handleAnys<type, never, [false] extends [type] ? Sym.GreenEmoji : interpretFailure<FalseLiteral, type, never>>
  type equal<a, b, fn extends Interpreter = Equal>
    = handleAnys<a, b, [relation.equal<a, b>] extends [true] ? Sym.GreenEmoji : interpretFailure<fn, a, b>>
    ;
  type equivalent<a, b, fn extends Interpreter = Equivalent>
    = handleAnys<a, b, [relation.equivalent<a, b>] extends [true] ? Sym.GreenEmoji : interpretFailure<fn, a, b>>
    ;
  namespace not {
    type equivalent<a, b, fn extends Interpreter = NotEquivalent>
      = handleAnys<a, b, [relation.notEquivalent<a, b>] extends [true] ? Sym.GreenEmoji : interpretFailure<fn, a, b>>
      ;
    type equal<a, b, fn extends Interpreter = NotEqual>
      = handleAnys<a, b, [relation.notEqual<a, b>] extends [true] ? Sym.GreenEmoji : interpretFailure<fn, a, b>>
      ;
  }
}

declare namespace interpreter {
  type trueLiteral<type extends { [0]: unknown }> = never | [𝐰𝐚𝐧𝐭: true, 𝐠𝐨𝐭: type[0]]
  type falseLiteral<type extends { [0]: unknown }> = never | [𝐰𝐚𝐧𝐭: false, 𝐠𝐨𝐭: type[0]]
  type point<map extends { [0]: unknown, [1]: unknown }> = never | [𝐥𝐞𝐟𝐭: map[0], 𝐫𝐢𝐠𝐡𝐭: map[1]]
  type equal<map extends { [0]: unknown, [1]: unknown }> = never | [𝐧𝐨𝐭_𝐞𝐪𝐮𝐚𝐥: point<map>]
  type equivalent<map extends { [0]: unknown, [1]: unknown }> = never | [𝐧𝐨𝐭_𝐞𝐪: point<map>]
  type not_equivalent<map extends { [0]: unknown, [1]: unknown }> = never | [𝐮𝐧𝐞𝐱𝐩𝐞𝐜𝐭𝐞𝐝_𝐞𝐪: point<map>]
  type not_equal<map extends { [0]: unknown, [1]: unknown }> = never | [𝐮𝐧𝐞𝐱𝐩𝐞𝐜𝐭𝐞𝐝_𝐞𝐪𝐮𝐚𝐥: point<map>]
}

type interpretFailure<fn extends Interpreter, left, right> = (fn & { 0: left, 1: right })[-1];
interface Interpreter { [-1]: unknown, [0]: unknown, [1]: unknown }

interface TrueLiteral extends Interpreter { [-1]: interpreter.trueLiteral<this> }
interface FalseLiteral extends Interpreter { [-1]: interpreter.falseLiteral<this> }
interface Equal extends Interpreter { [-1]: interpreter.equal<this> }
interface Equivalent extends Interpreter { [-1]: interpreter.equivalent<this> }
interface NotEquivalent extends Interpreter { [-1]: interpreter.not_equivalent<this> }
interface NotEqual extends Interpreter { [-1]: interpreter.not_equal<this> }

declare namespace relation {
  type illegalState = typeof illegalState
  const illegalState: unique symbol
  type not<type extends boolean>
    = [type] extends [true] ? false
    : [type] extends [false] ? true
    : illegalState
    ;

  type notEquivalent<a, b> = not<equivalent<a, b>>
  type notEqual<a, b> = not<equal<a, b>>
  type equivalent<a, b> = [a, b] extends [b, a] ? true : false
  /** OG source: https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650 */
  type equal<a, b> =
    (<fix>() => fix extends a ? 1 : 2) extends
    (<fix>() => fix extends b ? 1 : 2) ? true : false
    ;
}

type handleAnys<a, b, ifNeitherIsAny>
  = bothAreAny<a, b> extends true ? BothIllegal
  : 0 extends 1 & a ? IllegalLeft
  : 0 extends 1 & b ? IllegalRight
  : ifNeitherIsAny
  ;

/** @internal */
type BothIllegal = never | [𝐋: Sym.IllegalAny, 𝐑: Sym.IllegalAny]
/** @internal */
type IllegalLeft = never | [𝐋: Sym.IllegalAny]
/** @internal */
type IllegalRight = never | [𝐑: Sym.IllegalAny]

type bothAreAny<a, b> =
  [true, true] extends [
    0 extends 1 & a ? true : false,
    0 extends 1 & b ? true : false
  ] ? true : false
  ;

namespace __Spec__ {
  declare const unsafeAny: any
  const singleAny: [Sym.IllegalAny] = [Sym.IllegalAny]
  const doubleAny: [Sym.IllegalAny, Sym.IllegalAny] = [Sym.IllegalAny, Sym.IllegalAny]

  describe("handleAnys", t => {
    // ^?
    return [
      expect(t.assert.equal(assert.isTrue(unsafeAny), singleAny)),
      expect(t.assert.equal(assert.isFalse(unsafeAny), singleAny)),
      expect(t.assert.equal(assert.equal(1, unsafeAny), singleAny)),
      expect(t.assert.equal(assert.equal(unsafeAny, 1), singleAny)),
      expect(t.assert.equal(assert.equal(unsafeAny, unsafeAny), doubleAny)),
    ]
  })

  describe("assert.equal", t => {
    // ^?
    return expect(t.assert.equal({ a: 1 }, { a: 1 }))
  })

  const result = describe(
    "comparing 2 unequal values raises a TypeError",
    t => ({
      /** @ts-expect-error: directive makes sure this relation raises a TypeError */
      notEqual: expectToFail(t.assert.not.equal({ a: 2 }, { a: 3 })),
      /** @ts-expect-error: directive makes sure this relation raises a TypeError */
      equal: expect(t.assert.equal({ a: 1 }, { a: 2 })),
    })
  )

  /** @ts-expect-error: testing to make sure comparing 2 unequal values raises a TypeError */
  type __2 = expect<assert.equal<{ a: 1 }, { a: 2 }>>
  //   ^?

  /** @ts-expect-error: testing to make sure comparing 2 unequal values raises a TypeError */
  const __2 = expect(assert.equal({ a: 1 }, { a: 2 }))
  //    ^?
  declare const __2_expected: ["🚫", [𝐧𝐨𝐭_𝐞𝐪𝐮𝐚𝐥: [𝐥𝐞𝐟𝐭: { readonly a: 1; }, 𝐫𝐢𝐠𝐡𝐭: { readonly a: 2; }]]]
  expect(assert.equal(__2, __2_expected))
  // ^?

  type __any_type__ = [
    // ^?
    expect<assert.equivalent<any.type, unknown>>,
    expect<assert.equivalent<any.object, object>>,
    /** `any.type` and `unknown` are equivalent, but not strictly equal */
    expect<assert.not.equal<any.type, unknown>>,
    /** order doesn't matter for binary relations */
    expect<assert.not.equal<any.object, object>>,
  ]

  declare const expectToFailErrorMsg: TypeError<[Sym.RedEmoji, `Expected a failing test, but got a passing one instead`]>

  describe(
    // ^?
    "expectToFail",
    t => [
      expect(
        assert.equal(
          /* @ts-expect-error: tests to make sure we're raising a TypeError here */
          expectToFail(t.assert.equal({ abc: 123 }, { abc: 123 })),
          expectToFailErrorMsg
        )
      ),
      expect(
        assert.equal(
          /* @ts-expect-error: tests to make sure we're raising a TypeError here */
          expectToFail(Sym.GreenEmoji),
          expectToFailErrorMsg
        )
      )
    ]
  )

}

