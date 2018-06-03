import React, { Component } from 'react'

class ProfilePic extends Component {

	onClick() {
		console.log("prof pic clicked")
	}

	render() {
		return (
            <div className="prof-pic">
              <img 
              src={this.props.src}
              onClick={this.onClick}
              />
            </div>
		);
	}
}