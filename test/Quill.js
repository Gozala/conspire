// @flow strict
import {
  QuillRichText,
  Marker,
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
  assert.deepEqual([...text.entries()], ["Gandalf the Grey\n"])
  assert.deepEqual(text.toJSON(), [
    { text: "Gandalf the Grey\n", attributes: {} }
  ])
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
  assert.deepEqual(
    [...text.entries()],
    ["Gandalf the ", Marker.from({ bold: true }), "Grey", Marker.clear(), "\n"]
  )

  assert.deepEqual(text.toJSON(), [
    { text: "Gandalf the ", attributes: {} },
    { text: "Grey", attributes: { bold: true } },
    { text: "\n", attributes: {} }
  ])

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
  assert.deepEqual(
    [...text.entries()],
    ["Gandalf ", Marker.from({ bold: true }), "Grey", Marker.clear(), "\n"]
  )

  assert.deepEqual(text.toContent(), {
    ops: [
      { insert: "Gandalf " },
      { insert: "Grey", attributes: { bold: true } },
      { insert: "\n", attributes: {} }
    ]
  })

  assert.deepEqual(text.toJSON(), [
    { text: "Gandalf ", attributes: {} },
    { text: "Grey", attributes: { bold: true } },
    { text: "\n", attributes: {} }
  ])
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
  assert.equal(text.size, 15, `text.size === ${text.size}`)
  assert.deepEqual(
    [...text.entries()],
    [
      "Gandalf ",
      Marker.from({ bold: true }),
      "Grey",
      Marker.from({ header: 1 }),
      "\n"
    ]
  )
  assert.deepEqual(text.toJSON(), [
    { text: "Gandalf ", attributes: {} },
    { text: "Grey", attributes: { bold: true } },
    { text: "\n", attributes: { header: 1 } }
  ])
  assert.deepEqual(text.toContent(), {
    ops: [
      { insert: "Gandalf " },
      { insert: "Grey", attributes: { bold: true } },
      { insert: "\n", attributes: { header: 1 } }
    ]
  })
})

test("bold segment, delete segment, create header, insert", assert => {
  const text = createQuillRichText().patch({
    ops: [
      {
        insert: "Gandalf the Grey\n"
      }
    ]
  })

  assert.deepEqual([...text.entries()], ["Gandalf the Grey\n"])

  text.patch({
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

  assert.deepEqual(
    [...text.entries()],
    ["Gandalf the ", Marker.from({ bold: true }), "Grey", Marker.clear(), "\n"]
  )

  text.patch({
    ops: [
      {
        retain: 8
      },
      {
        delete: 4
      }
    ]
  })

  assert.deepEqual(
    [...text.entries()],
    ["Gandalf ", Marker.from({ bold: true }), "Grey", Marker.clear(), "\n"]
  )

  text.patch({
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

  assert.deepEqual(
    [...text.entries()],
    [
      "Gandalf ",
      Marker.from({ bold: true }),
      "Grey",
      Marker.from({ header: 1 }),
      "\n"
    ]
  )

  text.patch({
    ops: [
      {
        retain: 13
      },
      {
        insert: "\nmore text\n"
      }
    ]
  })

  assert.deepEqual(
    [...text.entries()],
    [
      "Gandalf ",
      Marker.from({ bold: true }),
      "Grey",
      Marker.from({ header: 1 }),
      "\n",
      Marker.clear(),
      "\nmore text\n"
    ]
  )

  assert.equal(text.length, 24, `text.length === ${text.length}`)
  assert.equal(text.size, 27, `text.size === ${text.size}`)

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
  assert.deepEqual(
    [...text.entries()],
    ["Gan", Marker.from({ bold: true }), "dalf", Marker.clear(), " the Grey\n"]
  )
  assert.deepEqual(
    text.toJSON()[
      ({ text: "Gan", attributes: {} },
      { text: "dalf", attributes: { bold: true } },
      { text: " the Grey\n", attributes: {} })
    ]
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

  assert.deepEqual(
    [...text.entries()],
    [Marker.from({ bold: true }), "Gandalf", Marker.clear(), " the Grey\n"]
  )
  assert.deepEqual(text.toJSON(), [
    { text: "Gandalf", attributes: { bold: true } },
    { text: " the Grey\n", attributes: {} }
  ])
  assert.equal(text.length, 17, `text length === ${text.length}`)
  assert.equal(text.size, 19, `node size is ${text.size}`)

  assert.deepEqual(text.toContent(), {
    ops: [
      { insert: "Gandalf", attributes: { bold: true } },
      { insert: " the Grey\n", attributes: {} }
    ]
  })
})

test("insert after marker", assert => {
  const text = createQuillRichText().patch({
    ops: [
      {
        insert: "Hello "
      },
      {
        attributes: {
          bold: true
        },
        insert: "World"
      },
      {
        insert: "\n"
      }
    ]
  })

  assert.deepEqual(
    [...text.entries()],
    ["Hello ", Marker.from({ bold: true }), "World", Marker.clear(), "\n"]
  )
  assert.deepEqual(text.toJSON(), [
    { text: "Hello ", attributes: {} },
    { text: "World", attributes: { bold: true } },
    { text: "\n", attributes: {} }
  ])
  assert.equal(text.length, 12, `text length === ${text.length}`)
  assert.equal(text.size, 14, `node size is ${text.size}`)

  text.patch({ ops: [{ retain: 11 }, { insert: "!" }] })

  assert.deepEqual(
    [...text.entries()],
    ["Hello ", Marker.from({ bold: true }), "World", Marker.clear(), "!\n"]
  )

  assert.equal(text.length, 13, `text length === ${text.length}`)
  assert.equal(text.size, 15, `node size is ${text.size}`)

  assert.deepEqual(text.toJSON(), [
    { text: "Hello ", attributes: {} },
    { text: "World", attributes: { bold: true } },
    { text: "!\n", attributes: {} }
  ])

  assert.deepEqual(text.toContent(), {
    ops: [
      { insert: "Hello " },
      { insert: "World", attributes: { bold: true } },
      { insert: "!\n", attributes: {} }
    ]
  })
})

test("split formatted block", assert => {
  const text = createQuillRichText().patch({
    ops: [
      {
        insert: "Hello "
      },
      {
        attributes: {
          italic: true
        },
        insert: "beautiful"
      },
      {
        insert: " world"
      },
      {
        attributes: {
          header: 1
        },
        insert: "\n"
      }
    ]
  })

  assert.deepEqual(
    [...text.entries()],
    [
      "Hello ",
      Marker.from({ italic: true }),
      "beautiful",
      Marker.clear(),
      " world",
      Marker.from({ header: 1 }),
      "\n"
    ]
  )
  assert.deepEqual(text.toJSON(), [
    { text: "Hello ", attributes: {} },
    { text: "beautiful", attributes: { italic: true } },
    { text: " world", attributes: {} },
    { text: "\n", attributes: { header: 1 } }
  ])
  assert.deepEqual(text.toContent(), {
    ops: [
      { insert: "Hello " },
      { insert: "beautiful", attributes: { italic: true } },
      { insert: " world", attributes: {} },
      { insert: "\n", attributes: { header: 1 } }
    ]
  })

  assert.equal(text.length, 22, `text length === ${text.length}`)
  assert.equal(text.size, 25, `node size is ${text.size}`)

  text.patch({
    ops: [{ retain: 10 }, { insert: "\n", attributes: { header: 1 } }]
  })

  assert.deepEqual(
    [...text.entries()],
    [
      "Hello ",
      Marker.from({ italic: true }),
      "beau",
      Marker.from({ header: 1 }),
      "\n",
      Marker.from({ italic: true }),
      "tiful",
      Marker.clear(),
      " world",
      Marker.from({ header: 1 }),
      "\n"
    ]
  )
  assert.deepEqual(text.toJSON(), [
    { text: "Hello ", attributes: {} },
    { text: "beau", attributes: { italic: true } },
    { text: "\n", attributes: { header: 1 } },
    { text: "tiful", attributes: { italic: true } },
    { text: " world", attributes: {} },
    { text: "\n", attributes: { header: 1 } }
  ])
  assert.deepEqual(text.toContent(), {
    ops: [
      { insert: "Hello " },
      { insert: "beau", attributes: { italic: true } },
      { insert: "\n", attributes: { header: 1 } },
      { insert: "tiful", attributes: { italic: true } },
      { insert: " world", attributes: {} },
      { insert: "\n", attributes: { header: 1 } }
    ]
  })

  assert.equal(text.length, 23, `text length === ${text.length}`)
  assert.equal(text.size, 28, `node size is ${text.size}`)
})
