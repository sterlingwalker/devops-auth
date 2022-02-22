

export const validateCredentials = async (creds) => {

    const response = await fetch('/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({user: creds.user, password: creds.password})
    })

    let result = {} 
    await response.json().then(data=> result = data)
    console.log(result)

    if (result.success == true) {
        window.location = 'http://dev.nightoff.org/'
    } else {
        window.location.reload();
    }
}