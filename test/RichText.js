// @flow strict

import { RichText, MutableList, create, test } from "./package.js"

test("basics", assert => {
  const text = create()
  assert.ok(text instanceof RichText, "instantiated")
  assert.equal(text.length, 0, "length is 0")
  assert.equal(text.size, 0, "token length is 0")
  assert.equal(text.inspect(), "<RichText></RichText>")
})

test("create", assert => {
  const text = create("hello")
  assert.equal(text.length, 5, `length is 5`)
  assert.equal(text.size, 5, "token length counts all tokens")
  assert.equal(text.inspect(), "<RichText>hello</RichText>")
})

test("retain.insert", assert => {
  const text = create("hello")

  text.retain(5).insert(" world", { bold: true })

  assert.equal(text.length, 11, "length only counts text characters")
  assert.equal(text.size, 12, "token length counts all tokens")
  assert.equal(text.inspect(), `<RichText>hello{"bold":true} world</RichText>`)
})

test("retain insert insert", assert => {
  const text = create("hello")
    .retain(5)
    .insert(" world", { bold: true })
    .reset()
    .retain(8)
    .insert("@", { bold: true })

  assert.equal(text.length, 12, "length only counts text characters")
  assert.equal(text.size, 13, "token length counts all tokens")
  assert.equal(text.inspect(), `<RichText>hello{"bold":true} wo@rld</RichText>`)
})

test("retain insert insert delete", assert => {
  const text = create("hello")
    .retain(5)
    .insert(" world", { bold: true })
    .reset()
    .retain(8)
    .insert("@", { bold: true })
    .reset()
    .retain(8)
    .insert("!", { bold: true })
    .delete(1)

  assert.equal(text.length, 12, "length only counts text characters")
  assert.equal(text.size, 13, "length only counts text characters")
  assert.equal(text.inspect(), `<RichText>hello{"bold":true} wo!rld</RichText>`)
})

test("retain insert insert delete delete", assert => {
  const text = create("hello")
    .retain(5)
    .insert(" world", { bold: true })
    .reset()
    .retain(8)
    .insert("@", { bold: true })
    .reset()
    .retain(8)
    .insert("!", { bold: true })
    .delete(1)
    .reset()
    .retain(5)
    .delete(1)

  assert.equal(text.length, 11, "length only counts text characters")
  assert.equal(text.size, 12)
  assert.equal(text.inspect(), `<RichText>hello{"bold":true}wo!rld</RichText>`)
})

test("retain insert insert delete delete delete", assert => {
  const text = create("hello")
    .retain(5)
    .insert(" world", { bold: true })
    .reset()
    .retain(8)
    .insert("@", { bold: true })
    .reset()
    .retain(8)
    .insert("!", { bold: true })
    .delete(1)
    .reset()
    .retain(5)
    .delete(1)

  assert.equal(text.length, 11, "length only counts text characters")
  assert.equal(text.size, 12)
  assert.equal(text.inspect(), `<RichText>hello{"bold":true}wo!rld</RichText>`)

  text
    .reset()
    .retain(4)
    .delete(3)

  assert.equal(text.length, 8, "length only counts text characters")
  assert.equal(text.size, 9)
  assert.equal(text.inspect(), `<RichText>hell{"bold":true}!rld</RichText>`)
})

test("overlap markers", assert => {
  const text = create([
    ..."hello",
    { attributes: { bold: true }, length: 0 },
    ..."world"
  ])

  assert.equal(text.length, 10, "length only counts text characters")
  assert.equal(text.size, 11)
  assert.equal(text.inspect(), `<RichText>hello{"bold":true}world</RichText>`)

  text.reset().retain(6, { bold: true, italic: true })

  assert.equal(text.length, 10, "length only counts text characters")
  assert.equal(text.size, 12)
  assert.equal(
    text.inspect(),
    `<RichText>{"bold":true,"italic":true}hellow{"bold":true}orld</RichText>`
  )
})
