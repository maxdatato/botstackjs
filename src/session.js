//We need to persist a map of session ids against users
//when we rx a message from fb, store the senderId alongside a UUID
//store the date and time when a session is added or updated so they can be pruned
var uuid = require('uuid');

var sessionIdMap = new Map();
var maxSessionAge_ms = 1000 * 60 * 180;

//if the senderId is not in the store, add it with a new UUID 
//if it is present, update the date
function set(senderId) {
    if(sessionIdMap.has(senderId)) {
        var mapObj = sessionIdMap.get(senderId);
        mapObj.lastUsed = new Date();
        
    } else {
        var mapObj = {
            sessionId: uuid.v1(),
            lastUsed: new Date()
        };
    }
    
    sessionIdMap.set(senderId, mapObj);
}

//grab the session ID for a user from the store
function get(senderId) {
    var item = sessionIdMap.get(senderId);
    return item ? item.sessionId : uuid.v1();     //or a new one, but unlikely
}

function printSessions() {
    sessionIdMap.forEach(function(item, key) {
        console.log('SenderID:' + key + ' SessionId:' + item.sessionId + ' Last Used:' + item.lastUsed);
    });
}

function clearOldSessions() {
    var now = new Date();
    var sessionSize = sessionIdMap.size;
    sessionIdMap.forEach(function(item, key, map) {
        if(Math.abs(now - item.lastUsed) > maxSessionAge_ms) {
            map.delete(key);
        }
    });
    console.log('Session Size ' + sessionIdMap.size + ' items. Removed ' + (sessionSize - sessionIdMap.size) + ' items');
}

//run frequently to remove sessions
setInterval(clearOldSessions, maxSessionAge_ms);

exports.set = set;
exports.get = get;
exports.printSessions = printSessions;
