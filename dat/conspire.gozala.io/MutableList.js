// @flow strict

export class MutableList /*::<a>*/ {
  /*::
  items:a[]
  @@iterator: () => Iterator<a>
  */
  constructor(...items /*:a[]*/) {
    this.items = items
  }
  // @noflow
  *[Symbol.iterator]() {
    for (const item of this.items) {
      yield item
    }
  }
  get length() {
    return this.items.length
  }
  get(n /*:number*/) /*:a*/ {
    return this.items[n]
  }
  insertAt(offset /*:number*/, ...items /*:a[]*/) {
    this.items.splice(offset, 0, ...items)
    return this
  }
  deleteAt(offset /*:number*/, count /*:number*/) {
    this.items.splice(offset, count)
  }
}
