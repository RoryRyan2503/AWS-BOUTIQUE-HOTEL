
////////  BOOKING PAGE ///////
let cd;


function WriteData() {

    const apiGatewayUrl = 'https://rta2zc46y0.execute-api.us-east-1.amazonaws.com/devcust/writeuser';
    const fname = document.getElementById('fname').value;
    const lname = document.getElementById('lname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phno').value;
    const dob = document.getElementById('birthday').value;
    const pass = document.getElementById('password').value;
    
    const cid = new Date();
    cd = String(cid.valueOf());
    localStorage.setItem('cuid',cd);
    const requestBody = {
            cust_id: cd,
            Firstname: fname,
    Lastname: lname,
    email_id: email,
    phoneno: phone,
    DOB: dob,
    pass: pass
  };

  console.log(requestBody);
  $.ajax({
      url: apiGatewayUrl,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(requestBody),
      success: function (data) {
          alert('details added!');
          window.location.href = 'rooms.html';
          
      },
      error: function (error) {
          alert('Error!');
          console.error(error);
      }
  });

  

}
////////////// LOGIN PAGE //////////////
function checkCredentials() {

    const apiGatewayEndpoint = 'https://rta2zc46y0.execute-api.us-east-1.amazonaws.com/devcust/fetchuser';

    // Get the email and password from the input fields
    var emailInput = document.getElementById("email").value;
    var passwordInput = document.getElementById("password").value;
// Make a GET request to the API Gateway endpoint
if(emailInput && passwordInput){
$.ajax({
    url: apiGatewayEndpoint,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
        if (data.length === 0) {
            alert('Account doesn\'t exist.\nCreate new account.');
            window.location.href = 'booking.html';}
        else{
          var customer = data.Customer.find(function (c) {
                return c.email_id === emailInput;
            });

            if (customer) {
                if (customer.pass === passwordInput) {
                    // Password matches, successful login
                    cd = customer.cust_id;
                    console.log(cd);
                    localStorage.setItem('cuid',cd);
                    localStorage.setItem('name',customer.Firstname);
                    alert("Login successful!");
                    window.location.href = 'rooms.html';
                } else {
                    // Password doesn't match
                    alert("Incorrect password!");
                }
            } else {
                // Email not found
                alert("Email not found!");
            }
          }
    },

    error: function (error) {
        console.error('Error fetching data:', error);
    }
});}
else{
    alert("Please Enter Email and Password!");
}

return cd;
            
}


///////////////// ROOMS PAGE//////////////

    const timestamp = new Date().getTime();
    const s3Url = `https://hotelboutiquedata.s3.amazonaws.com/roomdata.csv?timestamp=${timestamp}`;

    // Fetch the CSV file using the Fetch API
    fetch(s3Url)
    .then(response => response.text())
    .then(csvData => displayRoomDetails(csvData))
    .catch(error => console.error('Error fetching CSV file:', error));

function displayRoomDetails(content) {
    globalcsv=[['RoomId', 'Name', 'Sleeps', 'Beds', 'area', 'price', 'available','start_roomno']];
    const roomContainer = document.getElementById('roomContainer');
    const rows = content.trim().split('\n');
    rows.forEach(function(row, index) {
        if (index === 0) {
            // Skip the header row
            return;
        }

        const columns = row.split(',');

        // Ensure the row has the expected number of columns
        if (columns.length === 8 && columns[6].trim() != 0 ) {
            const roomId = columns[0].trim();
            const name = columns[1].trim();
            const sleeps = columns[2].trim();
            const beds = columns[3].trim();
            const area = columns[4].trim();
            const price = columns[5].trim();
            const available = columns[6].trim();
            const startRoomNo = columns[7].trim();

            const arow = [roomId,name,sleeps,beds,area,price,available,startRoomNo];
            globalcsv.push(arow);

            // Create a div element for each room and display details
            const roomBox = document.createElement('div');
            roomBox.className = 'room-box ';

            // Create a radio button
            const radioButton = document.createElement('input');
            radioButton.type = 'radio';
            radioButton.name = 'roomSelection';
            radioButton.value = roomId;
            radioButton.dataset.sleeps = sleeps;
            radioButton.dataset.available = available;
            radioButton.dataset.startroomno = startRoomNo;


            // Create an image element
            const roomImage = document.createElement('img');
            roomImage.className = 'room-image';
            roomImage.src = `https://hotelboutiquedata.s3.amazonaws.com/rid${roomId}.jpeg`; // Replace with the actual path to your images

            roomBox.appendChild(radioButton);
            roomBox.appendChild(roomImage);

            roomBox.innerHTML += `
                <div class="rcard">

                <p><strong>Room ID:</strong> ${roomId}</p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Sleeps:</strong> ${sleeps}</p>
                <p><strong>Beds:</strong> ${beds}</p>
                <p><strong>Area:</strong> ${area}</p>
                <p><strong>Price:</strong> ${price}</p>
                <p><strong>Available:</strong> ${available}</p>

                </div>
            `;

            // Append the room box to the container
            roomContainer.appendChild(roomBox);
        }
    });

}

function bookRoom() {
    const cuid = localStorage.getItem('cuid');
    console.log(cuid);
    const selectedRoomId = document.querySelector('input[name="roomSelection"]:checked');
  
    const bid = new Date();
    let bd = (bid.valueOf())*2;


    const in_date = document.getElementById('startDate').value;
    const out_date = document.getElementById('endDate').value;
    if (selectedRoomId && in_date && out_date) {
        //alert(`Room ${selectedRoomId.dataset.available} booked!`);
        const apiGatewayUrl = 'https://0t4cbcmi3l.execute-api.us-east-1.amazonaws.com/devbook/putBookingdata';
        
        const requestBody = {
                bookingID: bd.toString(),
                roomno: String(Number(selectedRoomId.dataset.startroomno) - Number(selectedRoomId.dataset.available)),
        checkin: in_date,
        checkout: out_date,
        custid: cuid,
        roomid: selectedRoomId.value,
        sleep: selectedRoomId.dataset.sleeps
      };
      console.log(requestBody);
      $.ajax({
          url: apiGatewayUrl,
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(requestBody),
          success: function (data) {
               //updating availability in s3 bucket
                    for (var i=0; i<=globalcsv.length;i++){
              if (globalcsv[i][0]==selectedRoomId.value){
                globalcsv[i][6]=String(Number(globalcsv[i][6])-1);
                break;
              }
            }
            const csvContent = globalcsv.map(row => row.join(',')).join('\n');
            const apiUrl = "https://lwz43b9z4l.execute-api.us-east-1.amazonaws.com/devbucket/updatebucket";
            console.log(JSON.stringify({csv_content: csvContent,}));
            $.ajax({
                url: apiUrl,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({csv_content: csvContent,}),
                success: function (data) {
                    alert("Room booked");
                    window.location.href='manageview.html';
                    console.log(data);
                },
                error: function (error) {
                    alert('Error saving student. Check the console for details.');
                    console.error(error);
                }
            });
    
    //update done                   
          },
          error: function (error) {
              alert('Error!');
              console.error(error);
          }
      });
    
   
    }else {
        alert('Please select all required data before booking room.');
    }
    
}

const n= localStorage.getItem('name');
console.log(n);
const x = document.getElementById('welcome');
if(n!=null){
x.innerHTML= "Welcome, " + n;
}

//////////////   USER DATA     ///////////////

function userdatahtml(){
const apiGatewayEndpoint = 'https://0t4cbcmi3l.execute-api.us-east-1.amazonaws.com/devbook/fetchBookingdata';

  
$.ajax({
    url: apiGatewayEndpoint,
    type: 'GET',
    dataType: 'json',
     success: function (data) {
			const cuid = localStorage.getItem('cuid');
			console.log(cuid);
			const filteredData = data.data.filter(item => item.custid === cuid);
      if (filteredData.length === 0) {
          alert('You have never booked with us before.');
          window.location.href = 'mymangepage.html';}
      else{
          displayBookingData(filteredData);}
        },
        error: function (error) {
            console.error('Error fetching data:', error);
        }
    });
}

function displayBookingData(data) {
        const cname = localStorage.getItem('cname');
        const today = new Date();
    
        // Filter data for current stay (check-out date greater than or equal to today)
        const currentStayData = data.filter(item => new Date(item.checkout) >= today);
    
        // Filter data for previous stay (check-out date less than today)
        const previousStayData = data.filter(item => new Date(item.checkout) < today);
    
        // Create a new div element
        const containerDiv = document.createElement('div');
        containerDiv.className = 'bdata';
    
        // Create a new heading element for current stay
        const currentStayHeading = document.createElement('h2');
        currentStayHeading.textContent = `Current Stay - ${cname}`;
    
        // Append the heading to the div
        containerDiv.appendChild(currentStayHeading);
    
        // Create a table element for current stay
        const currentStayTable = document.createElement('table');
        const currentStayThead = document.createElement('thead');
        const currentStayTbody = document.createElement('tbody');
    
        // Append the table head and body to the table
        currentStayTable.appendChild(currentStayThead);
        currentStayTable.appendChild(currentStayTbody);
    
        // Add column headers to the table head for current stay
        const currentStayHeaderRow = document.createElement('tr');
        currentStayHeaderRow.innerHTML = `
            <th>Booking ID</th>
            <th>Check-in</th>
            <th>Room No</th>
            <th>Check-out</th>
            <th>Sleep</th>
        `;
        currentStayThead.appendChild(currentStayHeaderRow);
    
        // Populate the table body for current stay with data
        currentStayData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.bookingID}</td>
                <td>${item.checkin}</td>
                <td>${item.roomno}</td>
                <td>${item.checkout}</td>
                <td>${item.sleep}</td>
            `;
            currentStayTbody.appendChild(row);
        });
    
        // Append the current stay table to the div
        containerDiv.appendChild(currentStayTable);
    
        // Create a new heading element for previous stay
        const previousStayHeading = document.createElement('h2');
        previousStayHeading.textContent = `Previous Stay - ${cname}`;
    
        // Append the heading to the div
        containerDiv.appendChild(previousStayHeading);
    
        // Create a table element for previous stay
        const previousStayTable = document.createElement('table');
        const previousStayThead = document.createElement('thead');
        const previousStayTbody = document.createElement('tbody');
    
        // Append the table head and body to the table
        previousStayTable.appendChild(previousStayThead);
        previousStayTable.appendChild(previousStayTbody);
    
        // Add column headers to the table head for previous stay
        const previousStayHeaderRow = document.createElement('tr');
        previousStayHeaderRow.innerHTML = `
            <th>Booking ID</th>
            <th>Check-in</th>
            <th>Room No</th>
            <th>Check-out</th>
            <th>Sleep</th>
        `;
        previousStayThead.appendChild(previousStayHeaderRow);
    
        // Populate the table body for previous stay with data
        previousStayData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.bookingID}</td>
                <td>${item.checkin}</td>
                <td>${item.roomno}</td>
                <td>${item.checkout}</td>
                <td>${item.sleep}</td>
            `;
            previousStayTbody.appendChild(row);
        });
    
        // Append the previous stay table to the div
        containerDiv.appendChild(previousStayTable);
    
        // Append the div to the body
        document.body.appendChild(containerDiv);
    }

    /////// LOGIN VIEW ///////

    function checkCredentialsVIEW() {

        const apiGatewayEndpoint = 'https://rta2zc46y0.execute-api.us-east-1.amazonaws.com/devcust/fetchuser';
    
        // Get the email and password from the input fields
        var emailInput = document.getElementById("email").value;
        var passwordInput = document.getElementById("password").value;
    // Make a GET request to the API Gateway endpoint
    $.ajax({
        url: apiGatewayEndpoint,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data.length === 0) {
                alert('Account doesn\'t exist.\nCreate new account.');
            }
            else{
              var customer = data.Customer.find(function (c) {
                    return c.email_id === emailInput;
                });
    
                if (customer) {
                    if (customer.pass === passwordInput) {
                        // Password matches, successful login
                        cd = customer.cust_id;
                        cname=String(customer.Firstname)+' '+String(customer.Lastname);
                        console.log(name);
                        localStorage.setItem('cname',cname);
                        localStorage.setItem('cuid',cd);
                        alert("Login successful!");
                        window.location.href='userdata.html';
                    } else {
                        // Password doesn't match
                        alert("Incorrect password!");
                    }
                } else {
                    // Email not found
                    alert("Email not found!");
                }
              }
        },
    
        error: function (error) {
            console.error('Error fetching data:', error);
        }
    });
    
    
                
      }
