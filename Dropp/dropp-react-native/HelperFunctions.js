
export function makeFormData(params){
    var formData = [];
    for (var k in params) {
        var encodedKey = encodeURIComponent(k);
        var encodedValue = encodeURIComponent(params[k]);
        formData.push(encodedKey + "=" + encodedValue);
    }
    formData = formData.join("&");
    return formData;
}
