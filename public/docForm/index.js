document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('signatureCanvas');
    var signaturePad = new SignaturePad(canvas);
    var clearSignatureBtn = document.getElementById('clearSignatureBtn');
    var form = document.querySelector('form');

    

    clearSignatureBtn.addEventListener('click', function (event) {
        event.preventDefault();
        signaturePad.clear();
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        //signature data
        const signatureData = signaturePad.toDataURL();
        //form data
        const signerName = document.getElementById("physicianName").value;
        const applicantName = document.getElementById("applicantName").value;
        const schoolOrg = document.getElementById("schoolOrg").value;
        const personalId = document.getElementById("personalId").value;
        const designation = document.getElementById("designation").value;
        const courseDate = document.getElementById("courseDate").value;
        const tetanusVaccine = document.getElementById("tetanusVaccine").value;
        const fitStatus = document.querySelector('input[name="fit_status"]:checked').value;
        const medicalText = document.getElementById("medical_text").value;
        const mcrNo = document.getElementById("mcrNo").value;
        const clinicName = document.getElementById("clinicName").value;
        const date = document.getElementById("date").value;
        const contactNo = document.getElementById("contactNo").value;
        const clinicAddress = document.getElementById("clinicAddress").value;

        const data = {
            signature: signatureData
        };

        const now = new Date();

        fetch('/uploadSign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const fullDate = year + "/" + month + "/" + day + "/" + hours + ":" + minutes + ":" + seconds;
            const signatureCredentials = `${data.url};${fullDate};${signerName}`
            
            const databaseEntry = {
                applicantName:applicantName,
                schoolOrg:schoolOrg,
                personalId:personalId,
                designation:designation,
                courseDate:courseDate,
                tetanusVaccine:tetanusVaccine,
                fitStatus:fitStatus,
                medicalText:medicalText,
                mcrNo:mcrNo,
                clinicName:clinicName,
                date:date,
                contactNo :contactNo,
                clinicAddress :clinicAddress,
                userName: signerName,
                signatureInfo: signatureCredentials
            }

            return fetch('/postSignInfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(databaseEntry)
            });
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/showDS';
            } else {
                throw new Error('Error uploading signature.');
            }
        })
        .catch(error => {
            console.log(error);
            alert('Error uploading signature.');
        });
    });
});
