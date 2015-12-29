var cliendID = "17222932902-h9p0194vetfj5qtprn6g1dhma472pqdm.apps.googleusercontent.com"
var clientSecret = "84Fa3n8G2NdmaiSKhoMFOilR"

$(document).ready(function() {
  showSpinner(true)

  $("#connect").click(function() { // This event fires when a button is clicked
    showSpinner(true)
    setTimeout(showSuccess,1000);
  });

  $("#titleHeader").click(function() { // This event fires when a button is clicked
    fakeSortSetup();
  });
  $("#viewedHeader").click(function() { // This event fires when a button is clicked
    fakeSortSetup();
  });
  $("#modifierHeader").click(function() { // This event fires when a button is clicked
    fakeSortSetup();
  });
  $("#modifiedHeader").click(function() { // This event fires when a button is clicked
    fakeSortSetup();
  });
});

function showSuccess() {
  $("#successImage").css('display', 'block');
  $("#mainDialog").css('display', 'none');
  showSpinner(false)
}

function fakeSortSetup() {
  showSpinner(true);
  $(".tableRow").css('display', 'none');
  setTimeout(fakeSort, 1000);
}

function fakeSort() {
  showSpinner(false);
  $(".tableRow").css('display', 'block');
}

function showSpinner(show) {
  if (show) {
    $("#spinnerElement").css('display', 'block');
  } else {
    $("#spinnerElement").css('display', 'none');
  }
}

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '17222932902-h9p0194vetfj5qtprn6g1dhma472pqdm.apps.googleusercontent.com';

var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    loadDriveApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'inline';
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

/**
 * Load Drive API client library.
 */
function loadDriveApi() {
  gapi.client.load('drive', 'v2', listFiles);
}

/**
 * Print files.
 */
function listFiles() {
  var request = gapi.client.drive.files.list({
      'maxResults': 10
    });

    request.execute(function(resp) {
      var files = resp.items;
      if (files && files.length > 0) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          var viewedDate = new Date(Date.parse(file.lastViewedByMeDate))
          var modifiedDate = new Date(Date.parse(file.modifiedDate))
          var viewedString = viewedDate.toLocaleDateString() + " " + viewedDate.toLocaleTimeString()
          var modifiedString = modifiedDate.toLocaleDateString() + " " + modifiedDate.toLocaleTimeString()

          addFile(i, file.title, viewedString, modifiedString, file.lastModifyingUserName);
        }

        showSpinner(false)
      } else {
        addFile('No files found.');
      }
    });
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function addFile(index, title, viewed, modified, modifier) {
  $("#myTable").last().append("<tr class='tableRow'><td>" + title +
                              "</td><td>" + viewed +
                              "</td><td>" + modifier +
                              "</td><td>" + modified +
                              "</td></tr>")
  /*var row = table.insertRow(index);
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell4 = row.insertCell(3);
  cell1.innerHTML = title;
  cell2.innerHTML = viewed;
  cell3.innerHTML = modified;
  cell4.innerHTML = modifier;*/
}
