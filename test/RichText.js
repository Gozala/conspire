// @flow strict

import { RichText, Marker, MutableList, create, test } from "./package.js"

test("basics", assert => {
  const text = create()
  assert.ok(text instanceof RichText, "instantiated")
  assert.equal(text.length, 0, "length is 0")
  assert.equal(text.size, 0, "token length is 0")
  assert.deepEqual([...text.entries()], [])
  assert.deepEqual(text.toJSON(), [])
})

test("create", assert => {
  const text = create("hello")
  assert.equal(text.length, 5, `length is 5`)
  assert.equal(text.size, 5, "token length counts all tokens")
  assert.deepEqual([...text.entries()], ["hello"])
  assert.deepEqual(text.toJSON(), [{ text: "hello", attributes: {} }])
})

test("retain.insert", assert => {
  const text = create("hello")

  text.insert(5, " world", { bold: true })

  assert.deepEqual(
    [...text.entries()],
    ["hello", Marker.from({ bold: true }), " world"]
  )
  assert.equal(text.length, 11, "length only counts text characters")
  assert.equal(text.size, 12, "token length counts all tokens")
  assert.deepEqual(text.toJSON(), [
    { text: "hello", attributes: {} },
    { text: " world", attributes: { bold: true } }
  ])
})

test("retain insert insert", assert => {
  const text = create("hello").insert(5, " world", { bold: true })

  assert.deepEqual(
    [...text.entries()],
    ["hello", Marker.from({ bold: true }), " world"]
  )
  assert.equal(text.length, 11, `text.length === ${text.length}`)
  assert.equal(text.size, 12, `text.size === ${text.size}`)

  text.insert(8, "@", { bold: true })
  assert.deepEqual(
    [...text.entries()],
    ["hello", Marker.from({ bold: true }), " wo@rld"]
  )
  assert.deepEqual(text.toJSON(), [
    { text: "hello", attributes: {} },
    { text: " wo@rld", attributes: { bold: true } }
  ])
  assert.equal(text.length, 12, `text.length === ${text.length}`)
  assert.equal(text.size, 13, `text.size === ${text.size}`)
})

test("retain insert insert delete", assert => {
  const text = create("hello")

  assert.deepEqual([...text.entries()], ["hello"])

  text.insert(5, " world", { bold: true })
  assert.deepEqual(
    [...text.entries()],
    ["hello", Marker.from({ bold: true }), " world"]
  )
  assert.deepEqual(text.toJSON(), [
    { text: "hello", attributes: {} },
    { text: " world", attributes: { bold: true } }
  ])

  text.insert(8, "@", { bold: true })
  assert.deepEqual(
    [...text.entries()],
    ["hello", Marker.from({ bold: true }), " wo@rld"]
  )
  assert.deepEqual(text.toJSON(), [
    { text: "hello", attributes: {} },
    { text: " wo@rld", attributes: { bold: true } }
  ])

  text.insert(8, "!", { bold: true })
  assert.deepEqual(
    [...text.entries()],
    ["hello", Marker.from({ bold: true }), " wo!@rld"]
  )
  assert.deepEqual(text.toJSON(), [
    { text: "hello", attributes: {} },
    { text: " wo!@rld", attributes: { bold: true } }
  ])

  text.delete(9, 1)
  assert.deepEqual(
    [...text.entries()],
    ["hello", Marker.from({ bold: true }), " wo!rld"]
  )
  // assert.deepEqual(text.toJSON(), [
  //   { text: "hello" },
  //   { text: " wo!rld", attributes: { bold: true } }
  // ])

  assert.equal(text.length, 12, `text.length === ${text.length}`)
  assert.equal(text.size, 13, `text.size === ${text.size}`)
})

test("retain insert insert delete delete", assert => {
  const text = create("hello")
    .insert(5, " world", { bold: true })
    .insert(8, "@", { bold: true })
    .insert(8, "!", { bold: true })
    .delete(9, 1)
    .delete(5, 1)

  assert.deepEqual(
    [...text.entries()],
    ["hello", Marker.from({ bold: true }), "wo!rld"]
  )
  assert.equal(text.length, 11, `length.length === ${text.length}`)
  assert.equal(text.size, 12, `text.size === ${text.size}`)

  assert.deepEqual(text.toJSON(), [
    { text: "hello", attributes: {} },
    { text: "wo!rld", attributes: { bold: true } }
  ])
})

test("retain insert insert delete delete delete", assert => {
  const text = create("hello")
    .insert(5, " world", { bold: true })
    .insert(8, "@", { bold: true })
    .insert(8, "!", { bold: true })
    .delete(9, 1)
    .delete(5, 1)

  assert.deepEqual(
    [...text.entries()],
    ["hello", Marker.from({ bold: true }), "wo!rld"]
  )

  text.delete(4, 3)

  assert.deepEqual(
    [...text.entries()],
    ["hell", Marker.from({ bold: true }), "!rld"]
  )
  assert.deepEqual(text.toJSON(), [
    { text: "hell", attributes: {} },
    { text: "!rld", attributes: { bold: true } }
  ])

  assert.equal(text.length, 8, "length only counts text characters")
  assert.equal(text.size, 9)
})

test("overlap markers", assert => {
  const text = create([..."hello", Marker.from({ bold: true }), ..."world"])

  assert.equal(text.length, 10, "length only counts text characters")
  assert.equal(text.size, 11)
  assert.deepEqual(
    [...text.entries()],
    ["hello", Marker.from({ bold: true }), "world"]
  )
  assert.deepEqual(text.toJSON(), [
    { text: "hello", attributes: {} },
    { text: "world", attributes: { bold: true } }
  ])

  text.format(0, 6, { bold: true, italic: true })

  assert.deepEqual(
    [...text.entries()],
    [
      Marker.from({ bold: true, italic: true }),
      "hellow",
      Marker.from({ bold: true }),
      "orld"
    ]
  )
  assert.deepEqual(text.toJSON(), [
    { text: "hellow", attributes: { bold: true, italic: true } },
    { text: "orld", attributes: { bold: true } }
  ])

  assert.equal(text.length, 10, `text.length === ${text.length}`)
  assert.equal(text.size, 12, `text.size === ${text.size}`)
})
