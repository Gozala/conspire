// @flow strict
import {
  QuillRichText,
  MutableList,
  patch,
  createQuillRichText,
  test
} from "./package.js"

test("simple insert", assert => {
  const text = createQuillRichText().patch({
    ops: [
      {
        insert: "Gandalf the Grey\n"
      }
    ]
  })

  assert.equal(text.length, 17, `text length is ${text.length}`)
  assert.equal(text.size, 17, `node size is ${text.size}`)
  assert.equal(text.inspect(), "<RichText>Gandalf the Grey\n</RichText>")

  assert.deepEqual(text.toContent(), {
    ops: [
      {
        insert: "Gandalf the Grey\n"
      }
    ]
  })
})

test("bold segment", assert => {
  const text = createQuillRichText()
    .patch({
      ops: [
        {
          insert: "Gandalf the Grey\n"
        }
      ]
    })
    .patch({
      ops: [
        {
          retain: 12
        },
        {
          retain: 4,
          attributes: {
            bold: true
          }
        }
      ]
    })

  assert.equal(text.length, 17, `text length is ${text.length}`)
  assert.equal(text.size, 19, `node size is ${text.size}`)
  assert.equal(
    text.inspect(),
    `<RichText>Gandalf the {"bold":true}Grey{}\n</RichText>`
  )
  assert.deepEqual(text.toContent(), {
    ops: [
      { insert: "Gandalf the " },
      { insert: "Grey", attributes: { bold: true } },
      { insert: "\n", attributes: {} }
    ]
  })
})

test("bold segment, delete segment", assert => {
  const text = createQuillRichText()
    .patch({
      ops: [
        {
          insert: "Gandalf the Grey\n"
        }
      ]
    })
    .patch({
      ops: [
        {
          retain: 12
        },
        {
          retain: 4,
          attributes: {
            bold: true
          }
        }
      ]
    })
    .patch({
      ops: [
        {
          retain: 8
        },
        {
          delete: 4
        }
      ]
    })

  assert.equal(text.length, 13, `text.length === ${text.length}`)
  assert.equal(text.size, 15, `text.size === ${text.size}`)
  assert.equal(
    text.inspect(),
    `<RichText>Gandalf {"bold":true}Grey{}\n</RichText>`
  )
  assert.deepEqual(text.toContent(), {
    ops: [
      { insert: "Gandalf " },
      { insert: "Grey", attributes: { bold: true } },
      { insert: "\n", attributes: {} }
    ]
  })
})

test("bold segment, delete segment, create header", assert => {
  const text = createQuillRichText()
    .patch({
      ops: [
        {
          insert: "Gandalf the Grey\n"
        }
      ]
    })
    .patch({
      ops: [
        {
          retain: 12
        },
        {
          retain: 4,
          attributes: {
            bold: true
          }
        }
      ]
    })
    .patch({
      ops: [
        {
          retain: 8
        },
        {
          delete: 4
        }
      ]
    })
    .patch({
      ops: [
        {
          retain: 12
        },
        {
          retain: 1,
          attributes: {
            header: 1
          }
        }
      ]
    })

  assert.equal(text.length, 13, `text.length === ${text.length}`)
  assert.equal(text.size, 16, `text.size === ${text.size}`)
  assert.equal(
    text.inspect(),
    `<RichText>Gandalf {"bold":true}Grey{"header":1}\n{}</RichText>`
  )

  assert.deepEqual(text.toContent(), {
    ops: [
      { insert: "Gandalf " },
      { insert: "Grey", attributes: { bold: true } },
      { insert: "\n", attributes: { header: 1 } }
    ]
  })
})

test("bold segment, delete segment, create header, insert", assert => {
  const text = createQuillRichText()
    .patch({
      ops: [
        {
          insert: "Gandalf the Grey\n"
        }
      ]
    })
    .patch({
      ops: [
        {
          retain: 12
        },
        {
          retain: 4,
          attributes: {
            bold: true
          }
        }
      ]
    })
    .patch({
      ops: [
        {
          retain: 8
        },
        {
          delete: 4
        }
      ]
    })
    .patch({
      ops: [
        {
          retain: 12
        },
        {
          retain: 1,
          attributes: {
            header: 1
          }
        }
      ]
    })
    .patch({
      ops: [
        {
          retain: 13
        },
        {
          insert: "\nmore text\n"
        }
      ]
    })

  assert.equal(text.length, 24, `text.length === ${text.length}`)
  assert.equal(text.size, 27, `text.size === ${text.size}`)
  assert.equal(
    text.inspect(),
    `<RichText>Gandalf {"bold":true}Grey{"header":1}\n{}\nmore text\n</RichText>`
  )

  assert.deepEqual(text.toContent(), {
    ops: [
      { insert: "Gandalf " },
      { insert: "Grey", attributes: { bold: true } },
      { insert: "\n", attributes: { header: 1 } },
      { insert: "\nmore text\n", attributes: {} }
    ]
  })
})

test("overlap markers", assert => {
  const text = createQuillRichText().patch({
    ops: [
      {
        insert: "Gandalf the Grey\n"
      }
    ]
  })

  text.patch({
    ops: [
      {
        retain: 3
      },
      {
        retain: 4,
        attributes: {
          bold: true
        }
      }
    ]
  })

  assert.equal(text.length, 17, `text length === ${text.length}`)
  assert.equal(text.size, 19, `node size is ${text.size}`)
  assert.equal(
    text.inspect(),
    `<RichText>Gan{"bold":true}dalf{} the Grey\n</RichText>`
  )

  text.patch({
    ops: [
      {
        retain: 6,
        attributes: {
          bold: true
        }
      }
    ]
  })

  assert.equal(text.length, 17, `text length === ${text.length}`)
  assert.equal(text.size, 19, `node size is ${text.size}`)
  assert.equal(
    text.inspect(),
    `<RichText>{"bold":true}Gandalf{} the Grey\n</RichText>`
  )

  assert.deepEqual(text.toContent(), {
    ops: [
      { insert: "Gandalf", attributes: { bold: true } },
      { insert: " the Grey\n", attributes: {} }
    ]
  })
})
