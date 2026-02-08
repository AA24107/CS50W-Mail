document.addEventListener('DOMContentLoaded', function() {
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
      console.log(emails);
  });
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  document.querySelector('#compose-form').onsubmit =() => {
    const recipients = document.querySelector("#compose-recipients").value;
    const subject = document.querySelector("#compose-subject").value;
    const body = document.querySelector("#compose-body").value;

    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body,
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
    });
    load_mailbox('sent');
    return false;
  };

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(result =>{
    result.forEach((email) => {
      const element = document.createElement('div');
      element.classList.add('email-item');
      element.addEventListener('click', () => show_mail(mailbox, email.id));
      if (mailbox != "sent") {
        if ( email.read === true) {
          element.style.backgroundColor = '#D3D3D3';
        }
        else {
          element.style.backgroundColor = "white";
        }
      }
      element.innerHTML = `<h2>${email.subject}</h2> <h5>${email.sender}</h5> <p>${email.timestamp}</p>`;
      document.querySelector('#emails-view').append(element);
    })
  })
}

function show_mail(mailbox, id) {
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(result => {
      const view = document.querySelector('#emails-view')
      view.innerHTML = '';
      view.innerHTML = `<div class= "email-item">
        <h3> <strong> Subject: </strong> ${result.subject} </h3> 
        <hr>
        <h6> <strong>To: </strong>${result.recipients}</h6> 
        <br> 
        <p>${result.body}</p>
        <h6> <strong>From: </strong>${result.sender}</h6>
        <p> ${result.timestamp} </p>
      </div>`;
      
      if (mailbox != 'sent') {
        const element = document.createElement('div');
        element.innerHTML = `<div> 
          <button id="archive"></button>
          <button id="reply">Reply</button>
        </div>`
        document.querySelector('#emails-view').append(element);
          
        const archive = document.querySelector("#archive");
        if (result.archived === false) {
            archive.innerHTML = 'Archive';
        }  else {
            archive.innerHTML ="Unarchive";
        }
        archive.addEventListener('click', () => {
          if (result.archived === false) {
            archive.innerHTML = 'Unarchive';  
            fetch(`/emails/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: true
              })
            });
          } else {
            archive.innerHTML ="Archive";
            fetch(`/emails/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: false
              })
            });
        };
    })}

    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    });
})
}
