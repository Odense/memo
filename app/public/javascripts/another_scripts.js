let passwordfield = document.getElementById('passwordfield');
let passwordconfirm = document.getElementById('confirmpasswordfield');
let caps = document.getElementById('caps');
let pesan = document.getElementById('pesan');
caps.addEventListener('keyup', function (event) {
    if (event.getModifierState('CapsLock')) {
        pesan.style.display = "block";
    }
    else {
        pesan.style.display = "none";
    }
});

passwordfield.addEventListener('keyup', function (event) {
    if (event.getModifierState('CapsLock')) {
        pesa.style.display = "block";
    }
    else {
        pesa.style.display = "none";
    }
});

passwordconfirm.addEventListener('keyup', function (event) {
    if (event.getModifierState('CapsLock')) {
        pesant.style.display = "block";
    }
    else {
        pesant.style.display = "none";
    }
});

function check(input)
{
    if (input.value != document.getElementById('passwordfield').value)
    {
        input.setCustomValidity('Your passwords should match!');
    }
    else
    {
        input.setCustomValidity('');
    }
};

bootstrapValidate('#usernamefield', 'min:5:Enter at least 5 characters!');
bootstrapValidate('#usernamefield', 'max:24:Please do not enter more than 25 characters');
bootstrapValidate('#usernamefield', 'required:This field is required!');
bootstrapValidate('#fullnamefield', 'min:5:Enter at least 5 characters!');
bootstrapValidate('#fullnamefield', 'max:49:Please do not enter more than 50 characters');
bootstrapValidate('#passwordfield', 'required:This field is required!');
bootstrapValidate('#passwordfield', 'max:19:Please do not enter more than 20 characters');
bootstrapValidate('#confirmpasswordfield', 'required:This field is required!');
bootstrapValidate('#confirmpasswordfield', 'matches:#passwordfield:Your passwords should match!');

function loadFile(event)
{
    let output = document.getElementById('output');
    output.src = URL.createObjectURL(event.target.files[0]);
};

function checkPassword(input)
{
    if(input.value !== document.getElementById('passwordfield').value)
    {
        input.setCustomValidity('Passwords shoud be matching!');
    }
    else
    {
        input.setCustomValidity('');
    }
}

function checkUsername(input)
{
    fetch('/api/v1/users/getByUsername/' + input.value)
    .then(x => x.json())
    .then(username => 
    {
        if(username)
        {
            input.setCustomValidity('Username have been token! Please choose another one...');
        }
        else
        {
            input.setCustomValidity('');
        }
    });
}