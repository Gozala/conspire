import { Channel } from "./channel.js"

export class Feed {
  constructor(id) {
    this.id = id
  }
}

export class FeedReader extends Feed {
  constructor(id, receiver) {
    super(id)
    this.messages = receiver
  }
}


export class FeedWriter extends FeedReader {
  constructor(id, channel = new Channel()) {
    super(id, channel.receiver)
    this.channel = channel
    this.queue = []
    this.status = IDLE
  }
  get reader() {
    const reader = new FeedReader(this.id, this.channer.receiver)
    Object.defineProperty(this, "reader", { value: reader })
    return reader
  }
  write(message) {
    this.queue.push(message)
    this.drain()
  }
  async drain() {
    if (this.status === IDLE) {
      this.status = ACTIVE
      while (this.status === ACTIVE) {
	    	const message = this.queue.shift()
        if (message) {
					await this.channel.sender.deliver(message)	
        } else {
          this.status = IDLE
        }
      }
    }
  }
}

export const IDLE = 0
export const ACTIVE = 1