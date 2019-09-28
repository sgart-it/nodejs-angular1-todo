/* definisco l'oggetto comune ad ogni risposta
   deve sempre esserci anche in caso di errore
   se tutto ok success va settato a true */
var ServiceStatus = function() {
  this.success = false;
  this.data = null;
  this.returnValue = 0;
  this.messages = [];
}

ServiceStatus.prototype._addMessage = function(sType, message, seconds, resetSuccess) {
  if (typeof seconds === 'undefined')
    seconds = 0;
  this.messages.push({ 't': sType, 'm': message, 's': seconds });
  if (resetSuccess)
    this.success = false;
};
ServiceStatus.prototype.addError = function(message, seconds) {
  this._addMessage('E', message, seconds, false);
};
ServiceStatus.prototype.addWarning = function(message, seconds) {
  this._addMessage('W', message, seconds, false);
};
ServiceStatus.prototype.addInfo = function(message, seconds) {
  this._addMessage('I', message, seconds, false);;
};
ServiceStatus.prototype.addSuccess = function(message, seconds) {
  if (typeof seconds === 'undefined')
    seconds = 3;  // i messaggi di success di default si chiudono dopo 3 secondi
  this._addMessage('S', message, seconds, false);
};

/* definisco gli export */
module.exports = ServiceStatus;