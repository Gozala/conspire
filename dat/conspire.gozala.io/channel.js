// @flow strict

export const OPEN = 0
export const CLOSING = 1
export const CLOSED = 2

/*::
type Status =
  | typeof OPEN
  | typeof CLOSING
  | typeof CLOSED

type State<a> = {
  senderStatus:Status;
  receiverStatus:Status;
  senders:*[];
  receivers:*[];
}
*/

export class Channel /*::<a>*/ {
  /*::
  closed:boolean;
  senders:*[];
  receivers:*[];
  senderStatus:Status;
  receiverStatus:Status;

  receiver:Receiver<a>;
  sender:Sender<a>;
  */
  constructor() {
    this.closed = false
    this.senders = []
    this.receivers = []
    this.senderStatus = OPEN
    this.receiverStatus = OPEN
  }
  get receiver() /*:Receiver<a>*/ {
    const receiver = new Receiver(this)
    Object.defineProperty(this, "receiver", { value: receiver })
    return receiver
  }
  get sender() /*:Sender<a>*/ {
    const sender = new Sender(this)
    Object.defineProperty(this, "sender", { value: sender })
    return sender
  }
}

export class Receiver /*::<a>*/ {
  /*::
  state:State<a>;
  */
  constructor(state /*:State<a>*/) {
    this.state = state
  }
  // @noflow
  [Symbol.asyncIterator]() {
    return this
  }
  /*::
  @@asyncIterator(): AsyncIterator<a> {
    return this
  }
  */
  next() /*:Promise<{ done: false, +value: a }| { done: true, +value?:void }>*/ {
    const { state } = this
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
    const { state } = this
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
    const { state } = this
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

export class Sender /*::<a>*/ {
  /*::
  state:State<a>
  */
  constructor(state /*:State<a>*/) {
    this.state = state
  }
  send(message /*:a*/) {
    const { state } = this
    if (state.senderStatus !== CLOSED) {
      const receiver = state.receivers.shift()
      if (receiver) {
        receiver({ done: false, value: message })
      } else if (state.receiverStatus == OPEN) {
        state.senders.push(() => message)
      }
    }
  }
  deliver(message /*:a*/) /*:Promise<boolean>*/ {
    const { state } = this
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
        return new Promise(resolve =>
          state.senders.push(succeed => {
            resolve(succeed)
            return message
          })
        )
      }
    }
  }
  close() {
    const { state } = this
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
