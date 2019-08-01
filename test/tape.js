import { test, runTests } from "https://deno.land/std/testing/mod.ts"
import {
  fail,
  assertEquals,
  assertNotEquals,
  assertStrictEq,
  unimplemented,
  assert,
  AssertionError
} from "https://deno.land/std/testing/asserts.ts"

class End {
  constructor(message) {
    this.message = message
  }
}

class Assert {
  end(error) {
    assert(!error)
    throw new End()
  }
  plan(n) {
    unimplemented()
  }
  skip(message) {
    throw new End(message)
  }
  fail(message) {
    fail(message)
  }
  pass(message) {
    assert(true, message)
  }
  timeoutAfter(ms) {
    unimplemented()
  }
  ok(value, message) {
    return assert(value, message)
  }
  true(value, message) {
    return this.ok(value, message)
  }
  assert(value, message) {
    return this.ok(value, message)
  }
  notOk(value, message) {
    return assert(!value, message)
  }
  false(value, message) {
    return this.notOk(value, message)
  }
  notok(value, message) {
    return this.notOk(value, message)
  }
  error(value, message) {
    return assert(value == null, message)
  }
  ifError(value, message) {
    return this.error(value, message)
  }
  ifErr(value, message) {
    return this.error(value, message)
  }
  iferror(value, message) {
    return this.error(value, message)
  }
  equal(actual, expected, message) {
    return assertStrictEq(actual, expected, message)
  }
  isEqual(actual, expected, message) {
    return this.equal(actual, expected, message)
  }
  is(actual, expected, message) {
    return this.equal(actual, expected, message)
  }
  strictEqual(actual, expected, message) {
    return this.equal(actual, expected, message)
  }
  strictEquals(actual, expected, message) {
    return this.equal(actual, expected, message)
  }
  notEqual(actual, expected, message) {
    if (actual === expected) {
      throw new AssertionError(message)
    }
  }
  notEquals(actual, expected, message) {
    return this.notEqual(actual, expected, message)
  }
  notStrictEqual(actual, expected, message) {
    return this.notEqual(actual, expected, message)
  }
  notStrictEquals(actual, expected, message) {
    return this.notEqual(actual, expected, message)
  }
  isNotEqual(actual, expected, message) {
    return this.notEqual(actual, expected, message)
  }
  isNot(actual, expected, message) {
    return this.notEqual(actual, expected, message)
  }
  not(actual, expected, message) {
    return this.notEqual(actual, expected, message)
  }
  doesNotEqual(actual, expected, message) {
    return this.notEqual(actual, expected, message)
  }
  isInequal(actual, expected, message) {
    return this.notEqual(actual, expected, message)
  }
  deepEqual(actual, expected, message) {
    return assertEquals(actual, expected, message)
  }
  deepEquals(actual, expected, message) {
    return this.deepEqual(actual, expected, message)
  }
  isEquivalent(actual, expected, message) {
    return this.deepEqual(actual, expected, message)
  }
  same(actual, expected, message) {
    return this.deepEqual(actual, expected, message)
  }
  notDeepEqual(actual, expected, message) {
    return assertNotEquals(actual, expected, message)
  }
  notDeepEquals(actual, expected, message) {
    return this.notDeepEqual(actual, expected, message)
  }
  notEquivalent(actual, expected, message) {
    return this.notDeepEqual(actual, expected, message)
  }
  notDeeply(actual, expected, message) {
    return this.notDeepEqual(actual, expected, message)
  }
  notSame(actual, expected, message) {
    return this.notDeepEqual(actual, expected, message)
  }
  isNotDeepEqual(actual, expected, message) {
    return this.notDeepEqual(actual, expected, message)
  }
  isNotDeeply(actual, expected, message) {
    return this.notDeepEqual(actual, expected, message)
  }
  isNotEquivalent(actual, expected, message) {
    return this.notDeepEqual(actual, expected, message)
  }
  isInequivalent(actual, expected, message) {
    return this.notDeepEqual(actual, expected, message)
  }
  deepLooseEqual(actual, expected, message) {
    return unimplemented()
  }
  looseEqual(actual, expected, message) {
    return this.deepLooseEqual(actual, expected, message)
  }
  looseEquals(actual, expected, message) {
    return this.deepLooseEqual(actual, expected, message)
  }
  notDeepLooseEqual(actual, expected, message) {
    return unimplemented()
  }
  notLooseEqual(actual, expected, message) {
    return this.notDeepLooseEqual(actual, expected, message)
  }
  notLooseEquals(actual, expected, message) {
    return this.notDeepLooseEqual(actual, expected, message)
  }
  throws(fn, expect, message) {
    return assertThrows(fn, expect, expect, message)
  }
  doesNotThrow(fn, expect, message) {
    return unimplemented()
  }
}

export default (name, fn) =>
  test({
    name,
    async fn() {
      await fn(new Assert())
    }
  })

window.onload = async () => {
  runTests()
}
