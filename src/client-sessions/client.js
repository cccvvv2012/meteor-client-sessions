ClientSessions = new Meteor.Collection('clientSessions');

// TODO this is gross
var ClientSessionConfig = function(options) {
  var defaultSessionKey = '_meteor_session_id';
  var defaultRememberKey = '_remember_me' + defaultSessionKey;
  var defaultOptions = {
    sessionKey: defaultSessionKey,
    rememberKey: defaultRememberKey,
  };
  _.extend(this, defaultOptions, options);
};
var clientSessionConfig = new ClientSessionConfig();

Meteor.subscribe('clientSessions', {
  sessionCookie: Cookie.get(clientSessionConfig.sessionKey),
  rememberCookie: Cookie.get(clientSessionConfig.rememberKey)
}, function onClientSessionComplete() {
  ClientSession.trigger('ready');
});

ClientSession._firstLoad = true;
Meteor.autosubscribe(function() {
  var clientSession = ClientSessions.findOne();

  if (clientSession) {

    if (!ClientSession._firstLoad)
      ClientSession.trigger('change');

    // Save a session cookie
    if (clientSession.key)
      Cookie.set(clientSessionConfig.sessionKey, clientSession.key);
    else
      Cookie.remove(clientSessionConfig.sessionKey);
    
    // Save remember me cookie
    if (clientSession.rememberCookie)
      Cookie.set(clientSessionConfig.rememberKey, clientSession.rememberCookie, {
        expires: clientSession.expires
      });
    else
      Cookie.remove(clientSessionConfig.rememberKey);

    ClientSession._firstLoad = false;
  }
});
