export function _fetch(url, data = {}, method = "GET") {
  return new Promise((resolve, reject) => {
    let options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    }
    if(method == 'POST') options['body'] = JSON.stringify(data);
    fetch(url, options).then(res => {
      res.json()
      .then((response) => {
        resolve(response);
      })
      .catch(err => {
        //console.log('fetchMe: failed to parse JSON');
        reject(err);
      })      
    }).catch(err => {
      //console.log('fetchMe: failed to FETCH');
      reject(err);
    });
  });
}