#!/usr/bin/env node
var fs = require("fs"), readline = require("readline"), events = require("events");

//first a cmd to remove everything.
console.log("asterisk -rx 'database deltree cidname'");

var emitter = new events.EventEmitter();

emitter.on("number", function(n){
  var cmd = "asterisk -rx 'database put cidname "+n.number+" "+n.name+"'";
  console.log(cmd);
});

var lb = readline.createInterface({ input: process.stdin, output: fs.createWriteStream("/dev/null") });

lb.on("line", function(line){
  //line in format: Res Nova,+447770628967; +447787504007
  // so name , type|"" number; type|"" number ...
  var bits = line.split(",");
  var name = JSON.stringify(bits[0].replace(/[^A-Za-z0-9\s-]+/g, "")); //correctly escape for insertion into single quoted command
  bits[1].split(";").map(normalizePhone).forEach(function(numbers){
    numbers.forEach(function(number){
      emitter.emit("number", {name:name, number:number});
    });
  });
});

function normalizePhone(num){
  //first remove any shizzle
  num = num.replace(/[^0-9+]/g, "");
  //now see if it is + prefixed.
  numbers = [num];
  switch(num[0]){
    case "+":
      //strip code code. assume 2 digits,
      numbers.push("0"+num.substring(3));
      break;
    case "0":
      if(num[1] === "0"){
        //double zero! replace with +, and strip
        numbers.push("+"+num.substring(2));
        numbers.push("0"+num.substring(4));
      }else{
        //normal case, add UK country code.
        numbers.push("+44"+num.substring(1));
      }
      break;
    default:
      //assume another country code, but no +
      numbers.push("+"+num);
      break;
  }
  return numbers;
}

//start!
process.stdin.resume();
