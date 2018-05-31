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
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.replace(urlRegex, '<a target="_blank" href="$1">$1</a>')
  }

  // replace hashtags with links
  hashtagify = text => {
    const hashtagRegex = /\B(#)(\w*[a-zA-Z]+\w*)/g
    return text.replace(hashtagRegex, '<Link to="/tag/$2" className="hashtag">$&</Link>')
  }


  render() {
    if (!this.props.post) {
      return null
    }

    const { stamp, message, author, hash, userHandle } = this.props.post;

    message = this.urlify(message)
    message = this.hashtagify(message)
    
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
        <div className="message">
          <div dangerouslySetInnerHTML={{ __html: message }} />
        </div>
    )
  }
}

export default Meow
