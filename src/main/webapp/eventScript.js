function specifiedAttendees(value) {
  if (value == "attendees") {
    document.getElementById("attendees-wrap").style.display = "block";
  }
  else {
    document.getElementById("attendees-wrap").style.display = "none";
  }
}

function addAttendees(){
  var number = document.getElementById("number-attendees").value;
  var container = document.getElementById("attendees-input");
  while (container.hasChildNodes()) {
      container.removeChild(container.lastChild);
  }
  for (i = 0; i < number; ++i){
      container.appendChild(document.createTextNode("Attendee " + (i+1)));
      var input = document.createElement("input");
      input.type = "text";
      input.id = "attendee" + i+1;
      container.appendChild(input);
      container.appendChild(document.createElement("br"));
  }
}

function checkAttendees() {
  var number = document.getElementById("number-attendees").value;
  var attendees = new Array();
  for (i = 0; i < number; ++i) {
    var id = "attendee" + i+1;
    attendees.push(document.getElementById(id).value);
  }
  document.getElementById("attendees-list").style.display = "block";
  document.getElementById("attendees-list").value = attendees;
}