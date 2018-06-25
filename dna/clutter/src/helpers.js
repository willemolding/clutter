
// helper function to do getLinks call, handle the no-link error case, and copy the returned entry values into a nicer array
function doGetLinkLoad(base, tag) {
  // get the tag from the base in the DHT
  var links = getLinks(base, tag, { Load: true });
  var links_filled = [];
  for (var i = 0; i < links.length; i++) {
    var link = { H: links[i].Hash };
    link[tag] = links[i].Entry;
    links_filled.push(link);
  }
  return links_filled;
}

// helper function to call getLinks, handle the no links entry error, and build a simpler links array.
function doGetLink(base, tag) {
  // get the tag from the base in the DHT
  var links = getLinks(base, tag, { Load: false });
  // debug("Links:"+JSON.stringify(links));
  var links_filled = [];
  for (var i = 0; i < links.length; i++) {
    links_filled.push(links[i].Hash);
  }
  return links_filled;
}

// returns a list of unique hashtags in the message string
function getHashtags(message) {
  var tags = message.match(/\B#\w*[a-zA-Z]+\w*/g);
  if (tags) {
    var uniqueTags = tags.filter(function(value, index, self) {
      return self.indexOf(value) === index;
    }); //remove duplicates
    return uniqueTags;
  } else {
    return [];
  }
}


function handleHash(appKeyHash) {
  // debug('appKeyHash ' + appKeyHash)
  if (appKeyHash === undefined) {
    appKeyHash = App.Key.Hash;
  }
  return getLinks(appKeyHash, 'handle', { Load: true })[0].Entry.replace(
    /"/g,
    ''
  );
}