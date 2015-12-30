var docIDs = [];
var thumbnailLinks = ["./thumb1.png", "./thumb2.png", "./thumb3.png"];

$(document).ready(function() {
  $("#mainDialog").css('display', 'none');

  $("#connectButton").click(function() { // This event fires when a button is clicked
    showSpinner(true)
    setTimeout(showSuccess,1000);
  });

  $('#connectButton').prop('disabled', true);
});

function showSuccess() {
  $("#successImage").css('display', 'block');
  $("#mainDialog").css('display', 'none');
  showSpinner(false)
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
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    loadDriveApi();
    $("#mainDialog").css('display', 'block');
    $("#authorize-button").css('display', 'none');
  } else {
    showSpinner(false)
    $("#mainDialog").css('display', 'none');
    $("#authorize-button").css('display', 'inline');
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

function listFiles() {
  listFiles(undefined)
}

/**
 * Print files.
 */
function listFiles(q) {
  clearTable();
  showSpinner(true)

  var request = gapi.client.drive.files.list({
      'maxResults': 20
  });

  if (q) {
    request = gapi.client.drive.files.list({
      'maxResults': 20,
      'q': "title contains '" + q + "'"
    });
  }

  request.execute(function(resp) {
    var files = resp.items;
    if (files && files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var viewedDate = new Date(Date.parse(file.lastViewedByMeDate))
        var modifiedDate = new Date(Date.parse(file.modifiedDate))
        var viewedString = viewedDate.toLocaleDateString() + " " + viewedDate.toLocaleTimeString()
        var modifiedString = modifiedDate.toLocaleDateString() + " " + modifiedDate.toLocaleTimeString()

        var lastUser = file.lastModifyingUserName;
        if (file.lastModifyingUserName == "") {
          lastUser = "NA";
        }

        addFile(i, file.title, viewedString, modifiedString, lastUser);
        docIDs.push(file.id)
      }

      addTableHandlers();
      showSpinner(false)
    } else {
      addFile('No files found.');
    }
  });
}

function getFileMetadata(fileId) {
  var request = gapi.client.drive.files.get({
    'fileId': fileId
  });
  request.execute(function(resp) {
    var link = resp.alternateLink;
    var title = resp.title;
    var randIndex = Math.floor((Math.random() * 3));
    var thumbnailLink = thumbnailLinks[randIndex];
    var owner = resp.ownerNames[0];
    populateMetadataGrid(title, link, thumbnailLink, owner, randIndex + 1);
  });
}

function downloadFile(file, callback) {
  if (file.downloadUrl) {
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file.downloadUrl);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onload = function() {
      callback(xhr.responseText);
    };
    xhr.onerror = function() {
      callback(null);
    };
    xhr.send();
  } else {
    callback(null);
  }
}

function populateMetadataGrid(title, link, thumbnailLink, owner, count) {
  $("#titleMetadata").replaceWith("<p id=\"titleMetadata\"><u>" + title + "</u></p>");
  $("#ownerMetadata").replaceWith("<p id=\"ownerMetadata\"><b>Owner: </b>" + owner +"</p>");
  $("#linkMetadata").replaceWith("<p id=\"linkMetadata\"><b>Open in Drive: </b><a href=" + link + " target=\"_blank\">link</a></p>")
  $("#worksheetMetadata").replaceWith("<p id=\"worksheetMetadata\"><b>Worksheet Count: </b>" + count + "</p>")

  $("#thumbnail").attr('src', thumbnailLink);
  $("#previewSpinner").css('display', 'none');
  $("#metadataContent").css('display', 'block');
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
                              "</td></tr>");
}

function clearTable() {
  $('#connectButton').prop('disabled', true);
  $('#myTable tr').slice(1).remove();
}

function clearSelected() {
  $('#connectButton').prop('disabled', true);
  $("table#myTable tr").removeClass("selected");
  $("#metadataContent").css('display', 'none');
  $('#instructions').css('display', 'block');
}

function addTableHandlers() {
  $("tbody").on("click", "tr", function(e) {
    var index = $("tr").index($(this));
    getFileMetadata(docIDs[index - 1]);
    $('#connectButton').prop('disabled', false);
    fetchMetadata();
    $(this)
       .addClass("selected")
       .siblings(".selected")
       .removeClass("selected");
  });

  $("#search").on("keyup", function() {
    clearSelected();
    var value = $(this).val().toLowerCase();

    $("table tr").each(function(index) {
        if (index !== 0) {

            $row = $(this);

            var title = $row.find("td:first").text().toLowerCase();;

            if (title.indexOf(value) !== 0) {
                $row.hide();
            }
            else {
                $row.show();
            }
        }
    });
  });
}

function fetchMetadata() {
  $("#previewSpinner").css('display', 'block');
  $('#instructions').css('display', 'none');
}
