export const OPEN = 0
export const CLOSING = 1
export const CLOSED = 2


export class Channel {
  constructor() {
    this.closed = false
    this.senders = []
    this.receivers = []
    this.senderStatus = OPEN
    this.receiverStatus = OPEN
  }
	get receiver() {
    const receiver = new Receiver(this)
    Object.defineProperty(this, "receiver", { value: receiver })
    return receiver
  }
  get sender() {
    const sender = new Sender(this)
    Object.defineProperty(this, "sender", { value: sender })
    return sender
  }
}


export class Receiver {
  constructor(state) {
    this.state = state
  }
  [Symbol.asyncIterator]() {
    return this
  }
  next() {
    const {state} = this
    const sender = state.senders.shift()
    if (sender) {
      return Promise.resolve({ value: sender(true), done: false })
    } else if (this.state.receiverStatus === CLOSED) {
      return Promise.resolve({ done: true })
    } else if (this.state.senderStatus === CLOSED) {
      return Promise.resolve({ done: true })
    } else {
      return new Promise(deliver => {
        state.receivers.push(deliver) 
      })
    }
  }
  poll() {
    const {state} = this
    const sender = state.senders.shift()
    if (sender) {
      return { value: sender(true), done: false }
    } else if (state.receiverStatus === CLOSED) {
      return { done: true }
    } else if (state.senderStatus === CLOSED) {
      return { done: true }
    } else {
      return null
    }
  }
  close() {
    const {state} = this
    if (state.receiverStatus === OPEN) {
	    state.receiverStatus = CLOSING
      while (state.receiverStatus === CLOSING) {
        const sender = state.senders.shift()
        if (sender) {
          sender(false)
        } else {
          state.receiverStatus = CLOSED  	
        }
      }
    }
  }
  return() {
    this.close()
  }
}

export class Sender {
  constructor(state) {
    this.state = state
  }
  send(message) {
    const {state} = this
    if (state.senderStatus !== CLOSED) {
      const receiver = state.receivers.shift()
      if (receiver) {
        receiver({ done: false, value: message })
      } else if (state.receiverStatus == OPEN) {
        state.senders.push(() => message)
      }
    }
  }
  deliver(message) {
    const {state} = this
    if (state.senderStatus === CLOSED) {
      return Promise.resolve(false)
    } else {
    	const receiver = state.receivers.shift()
	    if (receiver) {
  	    receiver({ done: false, value: message })
    	  return Promise.resolve(true)
	    } else if (state.receiverStatus === CLOSED) {
  	    return Promise.resolve(false)
    	} else {
      	return new Promise(resolve => state.senders.push(succeed => { resolve(succeed); return message }))
	    }
    }
  }
  close() {
    const {state} = this
    if (state.senderStatus === OPEN) {
      state.senderStatus = CLOSING
      while (state.senderStatus === CLOSING) {
        const receiver = state.receivers.shift()
        if (receiver) {
          receiver({ done: true })
        } else {
          state.senderStatus = CLOSED  	
        }
      }
    }
  }
}