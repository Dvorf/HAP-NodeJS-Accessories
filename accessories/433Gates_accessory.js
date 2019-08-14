var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var mqtt = require('mqtt');
var MQTT_IP = 'localhost'; //change this if your MQTT broker is different


var name = "Gate open sensor"; //accessory name
var sonoffUUID = "hap-nodejs:accessories:GateOpenSensor"; //change this to your preferences
var sonoffUsername = "60:01:94:A3:93:4A";
var MQTT_NAME = 'RF433'; //MQTT topic that was set on the Sonoff firmware
//var delay = 10000; //time in ms while the sensor is active
//var rfcode = ''; //1..7FFFFF or 'any' device sensor specific code
var rfcodeopen = '99559E'; //1..7FFFFF
var rfcodeclosed = '995597'; //1..7FFFFF
var rfcodelowbattery = "000000"
var rfcodebatteryOK = "000000"
//var rfkey = '1'; //1..16 or 'any' (or 'None'?)



var timeout;

var options = {
  port: 1883,
  host: MQTT_IP,
//  username: 'pi', //enable only if you have authentication on your MQTT broker
//  password: 'raspberry', //enable only if you have authentication on your MQTT broker
  clientId: MQTT_NAME+'HAP'
};

var client = mqtt.connect(options);



var sonoff = exports.accessory = new Accessory(name, uuid.generate(sonoffUUID));
sonoff.addService(Service.ContactSensor);

sonoff.username = sonoffUsername;
sonoff.pincode = "031-45-154";



client.on('message', function(topic, message) {
console.log('From topic ' + topic + ' received MQTT message: ' + message.toString());
data = JSON.parse(message);
if (data === null) return null;
var rfreceiveddata = data.RfReceived.Data;
//var rfreceivedrfkey = data.RfReceived.RfKey;
/////////////////////////////
var sensoropen = Boolean (rfcodeopen == rfreceiveddata);
if (sensoropen) {
    sonoff.getService(Service.ContactSensor).getCharacteristic(Characteristic.ContactSensorState).setValue(1);
}
var sensorclosed = Boolean (rfcodeclosed == rfreceiveddata);
if (sensorclosed) {
    sonoff.getService(Service.ContactSensor).getCharacteristic(Characteristic.ContactSensorState).setValue(0);
}
var sensoropen = Boolean (rfcodelowbattery == rfreceiveddata);
if (sensoropen) {
    sonoff.getService(Service.ContactSensor).getCharacteristic(Characteristic.StatusLowBattery).setValue(1);
}
var sensorclosed = Boolean (rfcodebatteryOK == rfreceiveddata);
if (sensorclosed) {
    sonoff.getService(Service.ContactSensor).getCharacteristic(Characteristic.StatusLowBattery).setValue(0);
}
//////////////////////////////

});

client.on('connect', function () {
  client.subscribe('tele/'+MQTT_NAME+'/RESULT');
});

