import {Dimensions} from  'react-native'
export const sys = {
    dwidth: Dimensions.get('window').width,
    dheight: Dimensions.get('window').height,
    mainColor: "#EB7136",
    grayColor: "#f2f2f2",
    titleColor:"#333333",
    subTitleColor:"#999999",
    whiteColor:"white",
    //host:"http://zy.visachina.cn"
    //host:"http://www.bangdating.net",
     host:"http://b.zyyule.top",
     purpleColor:'rgba(118, 115, 247, 1)',
}


function toForm(data) {
    let formData = new FormData()
    let keyArr = Object.keys(data)
    if (keyArr.length < 1){return {}}
    keyArr.map((item) => {
        formData.append(item, data[item])
    })
    return formData
}

function toJsonStr(data) {
    return JSON.stringify(data)
}

function formatData(headers, data) {
    if (!headers || !headers['Content-Type'] || headers['Content-Type'] === 'application/x-www-form-urlencoded'){
        return toForm(data)
    }

    switch (headers['Content-Type']) {
        case 'application/json':
            return toJsonStr(data)
        default :
            return toForm(data)
    }
}

export default ajax = ({url, method, data, dataType, headers, success, error, complete}) => {

    console.log(url)

    let options = {}

    //默认method
    options['method'] = method || 'GET'

    //默认header
    options['headers'] = Object.assign({
        'Content-Type': 'application/x-www-form-urlencoded', //默认格式
        'credentials': 'include', //包含cookie
        'mode': 'cors', //允许跨域
    }, headers)

    //处理body
    options.method.toUpperCase() === 'POST' && (options['json'] == data ? formatData(headers, data) : '')

    fetch(url, options).then((response) => 
        response.json()
    ).then((responseJson) => {
        success && success(responseJson)
        complete && complete(responseJson)
    }).catch((err) => {
        error && error(err)
        complete && complete()
    })

}