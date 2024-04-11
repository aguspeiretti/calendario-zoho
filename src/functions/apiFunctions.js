export function getRecord(module, registerID) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.API.getRecord({ Entity: module, RecordID: registerID })
      .then(function (response) {
        const register = response.data[0];
        resolve({ register });
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function getUsers() {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.API.getAllUsers({
      Type: "ActiveUsers",
      page: 1,
      per_page: 200,
    })
      .then(function (response) {
        console.log("respuesta users", response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function attachFile(registerID, file) {
  console.log("data del attach");
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.API.attachFile({
      Entity: "Leads",
      RecordID: registerID,
      File: { Name: "myFile.txt", Content: file },
    })
      .then(function (data) {
        resolve(data);
        console.log("esta es la data del attach", data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function getFields(entrity) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.META.getFields({ Entity: "Leads" })
      .then(function (response) {
        console.log("respuesta Fields", response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export function execute(func_name, req_data) {
  return new Promise(function (resolve, reject) {
    window.ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
      .then(function (data) {
        console.log(data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}


// export function getUsers() {
//   return new Promise(function (resolve, reject) {
//     window.ZOHO.CRM.API.getAllUsers({
//       Type: "ActiveUsers",
//       page: 1,
//       per_page: 200,
//     })
//       .then(function (response) {
//         console.log("respuesta users", response);
//       })
//       .catch(function (error) {
//         reject(error);
//       });
//   });
// }