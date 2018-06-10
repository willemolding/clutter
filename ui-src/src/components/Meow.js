import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Meow extends Component {
  componentDidMount() {
    if (!this.props.post) {
      this.props.getPost()
    }
  }

  // replace 'https' URLs with links
  urlify = text => {
    const urlRegexSplit = text.split(/(https?:\/\/[^\s]+)/g)
    return urlRegexSplit.map((str, i) => {
      if (str.startsWith('https')) {
        return (
          <a key={i} target="_blank" href={str}>
            {str}
          </a>
        )
      } else if (str.includes('#')) {
        return this.hashify(str)
      }
      return str
    })
  }

<<<<<<< HEAD
  //identify all hashtags and replace with links
  hashify = text => {
    const message = text
    const splitMessage = message.split(/(\B#\w*[a-zA-Z]+\w*)/g)
    return splitMessage.map((str, i) => {
      if (str.startsWith('#')) {
        return (
          <Link key={i} to={`/tag/${str.replace('#', '')}`} className="hashtag">
            {str}
          </Link>
        )
      } else {
        return str
      }
    })
  }
=======
  // replace hashtags with links
  hashtagify = text => {
    const hashtagRegex = /\B(#)(\w*[a-zA-Z]+\w*)/g
    return text.replace(hashtagRegex, '<Link to="/tag/$2" className="hashtag">$&</Link>')
  }

>>>>>>> 0de45aa3a0c8c72b5b24bc42c6a2706d9f623343

  render() {
    if (!this.props.post) {
      return null
    }
<<<<<<< HEAD
    const { stamp, message, author, hash, userHandle } = this.props.post
=======

    const { stamp, message, author, hash, userHandle } = this.props.post;

    let formattedMessage = message
    formattedMessage = this.urlify(message)
    formattedMessage = this.hashtagify(message)
    
>>>>>>> 0de45aa3a0c8c72b5b24bc42c6a2706d9f623343
    return (
      <div className="meow" id={stamp}>
        <a className="meow-edit" onClick={() => "openEditPost('+id+')"}>
          edit
        </a>
        <Link to={`/u/${author}`} className="user">
          @{userHandle}
        </Link>{' '}
        |{' '}
        <Link to={`/meow/${hash}`} className="stamp">
          {new Date(stamp).toString()}
        </Link>
<<<<<<< HEAD
        <div className="message">{this.urlify(message)}</div>
=======
        <div className="message">
          <div dangerouslySetInnerHTML={{ __html: message }} />
        </div>
>>>>>>> 0de45aa3a0c8c72b5b24bc42c6a2706d9f623343
      </div>
    )
  }
}

export default Meow
