// GENESIS - Called only when your source chain is generated:'hc gen chain <name>'
// ===============================================================================
function genesis() {
  // 'hc gen chain' calls the genesis function in every zome file for the app

  return true;
}

// ===============================================================================
//   VALIDATION functions for *EVERY* change made to DHT entry -
//     Every DHT node uses their own copy of these functions to validate
//     any and all changes requested before accepting. put / mod / del & metas
// ===============================================================================

function validateCommit(entry_type, entry, header, pkg, sources) {
  // debug("Clutter validate commit: "+ JSON.stringify(pkg));
  return validate(entry_type, entry, header, sources);
}

function validatePut(entry_type, entry, header, pkg, sources) {
  // debug("Clutter validate put: "+ JSON.stringify(pkg));
  return validate(entry_type, entry, header, sources);
}

function validate(entry_type, entry, header, sources) {
  if (entry_type == 'post') {
    var l = entry.message.length;
    if (l > 0 && l < 256) {
      return true;
    }
    return false;
  }
  if (entry_type == 'handle') {
    return true;
  }
  if (entry_type == 'follow') {
    return true;
  }
  return true;
}

// Are there types of tags that you need special permission to add links?
// Examples:
//   - Only Bob should be able to make Bob a "follower" of Alice
//   - Only Bob should be able to list Alice in his people he is "following"
function validateLink(linkEntryType, baseHash, links, pkg, sources) {
  // debug("Clutter validate link: " + sources);
  // if (linkEntryType=="handle_links") {
  //     var length = links.length;
  //     // a valid handle is when:
  //
  //     // there should just be one or two links only
  //     if (length==2) {
  //         // if this is a modify it will have two links the first of which
  //         // will be the del and the second the new link.
  //         if (links[0].LinkAction != HC.LinkAction.Del) return false;
  //         if (links[1].LinkAction != HC.LinkAction.Add) return false;
  //     } else if (length==1) {
  //         // if this is a new handle, there will just be one Add link
  //         if (links[0].LinkAction != HC.LinkAction.Add) return false;
  //     } else {return false;}
  //
  //     for (var i=0;i<length;i++) {
  //         var link = links[i];
  //         // the base must be this base
  //         if (link.Base != baseHash) return false;
  //         // the base must be the source
  //         if (link.Base != sources[0]) return false;
  //         // The tag name should be "handle"
  //         if (link.Tag != "handle") return false;
  //         //TODO check something about the link, i.e. get it and check it's type?
  //     }
  //     return true;
  // }
  return true;
}
function validateMod(entry_type, entry, header, replaces, pkg, sources) {
  // debug("Clutter validate mod: "+entry_type+" header:"+JSON.stringify(header)+" replaces:"+JSON.stringify(replaces));
  if (entry_type == 'handle') {
    // check that the source is the same as the creator
    // TODO we could also check that the previous link in the type-chain is the replaces hash.
    var orig_sources = get(replaces, { GetMask: HC.GetMask.Sources });
    if (
      isErr(orig_sources) ||
      orig_sources == undefined ||
      orig_sources.length != 1 ||
      orig_sources[0] != sources[0]
    ) {
      return false;
    }
  } else if (entry_type == 'post') {
    // there must actually be a message
    if (entry.message == '') return false;
    var orig = get(replaces, {
      GetMask: HC.GetMask.Sources + HC.GetMask.Entry
    });

    // check that source is same as creator
    if (orig.Sources.length != 1 || orig.Sources[0] != sources[0]) {
      return false;
    }

    var orig_message = orig.Entry.message;
    // message must actually be different
    return orig_message != entry.message;
  }
  return true;
}
function validateDel(entry_type, hash, pkg, sources) {
  // debug('Clutter validateDel:' + sources)
  return true;
}
function validatePutPkg(entry_type) {
  debug('Clutter validatePutPkg: ' + App.Agent.String);
  var req = {};
  req[HC.PkgReq.Chain] = HC.PkgReq.ChainOpt.Full;
  return req;
}
function validateModPkg(entry_type) {
  // debug('Clutter validateModPkg')
  return null;
}
function validateDelPkg(entry_type) {
  // debug('Clutter validateDelPkg')
  return null;
}
function validateLinkPkg(entry_type) {
  // debug('Clutter validateLinkPkg')
  return null;
}
