function getProperty(name) {
  // The definition of the function you intend to expose
  return property(name); // Retrieves a property of the holochain from the DNA (e.g., Name, Language
}

/**
 * @param data is a string representing a 64-bit encoded image
 * @return data which is a 64-bit encoded image
 **/
function setProfilePic(data) {
  return setProfileProp(data, PROFILE_PIC);
}

/**
 * @param data is a string representing a firstName
 * @return data which is firstName
 **/
function setFirstName(data) {
  return setProfileProp(data, FIRST_NAME);
}

/**
 * @param data is a string representing a profile data field
 * @param tag is the tag used to store the profile data
 * @return data which is a profile data field
 **/
function setProfileProp(data, tag) {
  var profilePropHash;
  var links;
  try {
    // Check if profile pic has been set and update if so.
    links = getLinks(App.Agent.Hash, tag, { Load: true });
  } catch (exception) {
    return 'Error getting links: ' + exception;
  }
  try {
    if (links && links.length > 0) {
      profilePropHash = update(tag, data, links[0].Hash);

      // Delete the old hash, so we only ever have one record
      commit('profile_links', {
        Links: [
          {
            Base: App.Agent.Hash,
            Link: links[0].Hash,
            Tag: tag,
            LinkAction: HC.LinkAction.Del
          }
        ]
      });
    } else {
      // Otherwise add it for the first time:
      profilePropHash = commit(tag, data);
    }
    // On the DHT, put a link from my hash to the hash of firstName
    commit('profile_links', {
      Links: [{ Base: App.Agent.Hash, Link: profilePropHash, Tag: tag }]
    });
  } catch (exception) {
    return 'Error updating or committing: ' + exception;
  }
  return data;
}

/**
 * @param none
 * @return profilePic associated with this user
 **/
function getProfilePic() {
  return getProfileProp(PROFILE_PIC);
}

/**
 * @param tag associated with the property we want to retrieve
 * @return profileProp associated with the tag and current user
 **/
function getProfileProp(tag) {
  var links;
  try {
    links = getLinks(App.Agent.Hash, tag, { Load: true });

    if (links.length < 1) {
      return '';
    }
  } catch (exception) {
    return 'Error (getting firstName): ' + exception;
  }
  return links[0].Entry;
}

/**
 * @param none
 * @return firstName associated with this user
 **/
function getFirstName() {
  return getProfileProp(FIRST_NAME);
}

function appProperty(name) {
  // The definition of the function you intend to expose
  if (name == 'Agent_Handle') {
    debug('Agent_Handle');
    debug(getHandle(App.Key.Hash));
    return getHandle(App.Key.Hash);
  }
  if (name == 'App_Agent_String') {
    return App.Agent.String;
  }
  if (name == 'App_Key_Hash') {
    return App.Key.Hash;
  }
  if (name == 'App_DNA_Hash') {
    return App.DNA.Hash;
  }
  return 'Error: No App Property with name: ' + name;
}

function newHandle(handle) {
  debug(
    '<mermaid>' +
      App.Agent.String +
      '-->>DHT:Check to see if ' +
      App.Agent.String +
      ' has any exisitng handles</mermaid>'
  );
  var handles = getLinks(App.Key.Hash, 'handle');
  debug(
    '<mermaid>DHT->>' +
      App.Agent.String +
      ':returned ' +
      handles.length +
      ' existing handles for ' +
      App.Agent.String +
      '</mermaid>'
  );
  if (handles.length > 0) {
    if (anchorExists('handle', handle) === 'false') {
      var oldKey = handles[0].Hash;
      var key = update('handle', anchor('handle', handle), oldKey);
      debug(
        '<mermaid>' +
          App.Agent.String +
          '->>' +
          App.Agent.String +
          ':' +
          App.Agent.String +
          ' has a handle so update it</mermaid>'
      );
      commit('handle_links', {
        Links: [
          {
            Base: App.Key.Hash,
            Link: oldKey,
            Tag: 'handle',
            LinkAction: HC.LinkAction.Del
          },
          { Base: App.Key.Hash, Link: key, Tag: 'handle' }
        ]
      });
      debug(
        '<mermaid>' +
          App.Agent.String +
          '->>DHT:Update link to ' +
          handle +
          ' in "handle_links"</mermaid>'
      );
      commit('directory_links', {
        Links: [
          {
            Base: App.DNA.Hash,
            Link: oldKey,
            Tag: 'handle',
            LinkAction: HC.LinkAction.Del
          },
          { Base: App.DNA.Hash, Link: key, Tag: 'handle' }
        ]
      });
      debug(
        '<mermaid>' +
          App.Agent.String +
          '->>DHT:Update link to ' +
          handle +
          ' in "directory_links"</mermaid>'
      );
      return key;
    } else {
      // debug('HandleInUse')
      return 'HandleInUse';
    }
  }
  if (anchorExists('handle', handle) === 'false') {
    var newHandleKey = commit('handle', anchor('handle', handle));
    debug(
      '<mermaid>' +
        App.Agent.String +
        '->>' +
        App.Agent.String +
        ':commit new handle' +
        handle +
        '</mermaid>'
    );
    debug(
      '<mermaid>' + App.Agent.String + '->>DHT:Publish ' + handle + '</mermaid>'
    );
    commit('handle_links', {
      Links: [{ Base: App.Key.Hash, Link: newHandleKey, Tag: 'handle' }]
    });
    debug(
      '<mermaid>' +
        App.Agent.String +
        '->>DHT:Link ' +
        newHandleKey +
        ' to "handle_links"</mermaid>'
    );
    commit('directory_links', {
      Links: [{ Base: App.DNA.Hash, Link: newHandleKey, Tag: 'directory' }]
    });
    debug(
      '<mermaid>' +
        App.Agent.String +
        '->>DHT:Link ' +
        handle +
        ' to "directory_links"</mermaid>'
    );
    return newHandleKey;
  } else {
    // debug('HandleInUse')
    return 'HandleInUse';
  }
}

// returns the handle of an agent by looking it up on the user's DHT entry, the last handle will be the current one?
function getHandle(agentKey) {
  var links = getLinks(agentKey, 'handle', { Load: true });
  // debug(links);
  if (links.length > 0) {
    var anchorHash = links[0].Entry.replace(/"/g, '');
    return get(anchorHash).anchorText;
  } else {
    return '';
  }
}

function getAgent(handle) {
  if (anchorExists('handle', handle) === 'false') {
    return '';
  } else {
    return get(anchor('handle', handle), { GetMask: HC.GetMask.Sources })[0];
  }
}

function getHandles() {
  // debug('get the handles');
  if (property('enableDirectoryAccess') != 'true') {
    return undefined;
  }

  var links = getLinks(App.DNA.Hash, 'directory', { Load: true });
  // debug(links);
  var handles = [];
  for (var i = 0; i < links.length; i++) {
    var handleHash = links[i].Source;
    var handle = get(links[i].Entry).anchorText;
    debug(handle + 'handle');
    handles.push({ handleHash: handleHash, handle: handle });
  }
  return handles;
}

function follow(handle) {
  // Expects a handle of the person you want to follow
  // Commits a new follow entry to my source chain
  // On the DHT, puts a link on their hash to my hash as a "follower"
  // On the DHT, puts a link on my hash to their hash as a "following"
  debug('Follow ' + handle);
  var anchorHash = anchor('handle', handle);
  debug(
    '<mermaid>' +
      App.Agent.String +
      '->>DHT:Link ' +
      handleHash() +
      ' to follow ' +
      anchorHash +
      '</mermaid>'
  );
  return commit('follow', {
    Links: [
      { Base: anchorHash, Link: handleHash(), Tag: 'followers' },
      { Base: handleHash(), Link: anchorHash, Tag: 'following' }
    ]
  });
}

// get a list of all the people from the DHT a user is following or follows
function getFollow(params) {
  var type = params.type;
  var base = anchor('handle', params.from);
  // var  base = makeHash('handle', params.from);
  debug('params.from ' + params.from + ' hash=' + JSON.stringify(base));
  var handles = [];
  if (type == 'followers' || type == 'following') {
    handleLinks = getLinks(base, type);
    for (var i = 0; i < handleLinks.length; i++) {
      handles.push(get(handleLinks[i].Hash).anchorText);
    }
  }
  return handles;
}

function post(post) {
  var key = commit('post', post); // Commits the post block to my source chain, assigns resulting hash to 'key'

  debug(
    '<mermaid>' +
      App.Agent.String +
      '->>' +
      App.Agent.String +
      ':commit new meow</mermaid>'
  );
  debug('<mermaid>' + App.Agent.String + '->>DHT:Publish new meow</mermaid>');

  // On the DHT, puts a link on my anchor to the new post
  commit('post_links', {
    Links: [{ Base: handleHash(), Link: key, Tag: 'post' }]
  });
  debug(
    '<mermaid>' +
      App.Agent.String +
      '->>DHT:Link meow to "post_links"</mermaid>'
  );

  // get any hashtags in the post message
  var hashtags = getHashtags(post.message);
  debug(hashtags);

  // create an anchor of type hashtag for each tag present
  // link from the the anchor to the post
  hashtags.forEach(function(hashtag) {
    var anchorHash = anchor('hashtag', hashtag);
    commit('post_links', {
      Links: [{ Base: anchorHash, Link: key, Tag: 'post' }]
    });
  });

  // debug(key);
  return key; // Returns the hash key of the new post to the calling function
}

function postMod(params) {
  // debug(params.post);
  var key = update('post', params.post, params.hash);
  // commit('post_links',
  //   {Links:[
  //      {Base: App.Key.Hash, Link: oldKey, Tag: 'handle', LinkAction: HC.LinkAction.Del},
  //      {Base: App.Key.Hash, Link: key, Tag: 'handle'}
  //   ]})
  return key;
}

// TODO add "last 10" or "since timestamp" when query info is supported
function getPostsBy(handles) {
  // From the DHT, gets all "post" metadata entries linked from this userAddress
  var posts = [];
  for (var i = 0; i < handles.length; i++) {
    var author = anchor('handle', handles[i]);
    var authorPosts = doGetLinkLoad(author, 'post');
    // add in the author
    for (var j = 0; j < authorPosts.length; j++) {
      var post = authorPosts[j];
      post.author = handles[i];
      posts.push(post);
    }
  }
  return posts;
}

function getPostsWithHashtag(input) {
  var hashtag = input;
  var targets = getLinks(anchor('hashtag', '#' + hashtag), 'post');

  var posts = [];
  targets.forEach(function(target) {
    posts.push(getPost({ postHash: target.Hash }));
  });

  return posts;
}

function getPost(params) {
  var post,
    rawPost = get(params.postHash, { GetMask: HC.GetMask.All });
  if (rawPost === null) {
    return null;
  } else {
    post = {
      post: rawPost.Entry,
      author: getHandle(rawPost.Sources[0]),
      H: params.postHash
    };
    return post;
  }
}