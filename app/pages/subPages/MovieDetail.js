/**
 * Created by guangqiang on 2017/9/7.
 */
import React, {Component} from 'react'
import {View, Text, Alert,TouchableOpacity,Dimensions,Image,Slider,StyleSheet, ActivityIndicator, Modal, Platform} from 'react-native'
//import Video from 'react-native-video'
//import VideoPlayer from 'react-native-video-controls';
import Video from 'react-native-af-video-player'
import Orientation from 'react-native-orientation'
import {commonStyle} from '../../utils/commonStyle'
import {Icon} from '../../utils/icon'
// import {Actions} from 'react-native-router-flux'
import {formatTime} from '../../utils/formatTime'
import deviceInfo from '../../utils/deviceInfo'
// import {MessageBarManager} from 'react-native-message-bar'
//import {StyleSheet} from '../../utils'
const playerHeight = 250
import RefreshListView, {RefreshState} from 'react-native-refresh-list-view'
import HttpUtils from "../../common/HttpUtil"
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
import {sys} from "../../common/Data"

export default class MovieDetail extends Component {

  constructor(props) {
    super(props)
    this.player = null
    this.state = {
      rate: 1,
      slideValue: 0.00,
      currentTime: 0.00,
      duration: 0.00,
      paused: false,
      playIcon: 'music_paused_o',
      isTouchedScreen: true,
      modalVisible: true,
      isLock: false,
      params:null
    }
  }

  componentWillMount() {
    const init = Orientation.getInitialOrientation()
    this.setState({
      init,
      orientation: init,
      specificOrientation: init
    })
  }

  componentDidMount() {

    let codeurl = 'app_video/play/id/'+this.props.navigation.state.params.item.id;
    
            let formData = new FormData();
            HttpUtils.post(codeurl,formData)
            .then(result=>{
                if(result['respCode']==1){
                   
                    this.setState({
                        params:result["data"],
                        sourceData:result["data"]["recom_list"]
                    })
                   // 服务器没有数据
                    //this.setState({refreshState: RefreshState.EmptyData})
                }else{
                }
            }).catch(error=>{
                
                Alert.alert(">>>>"+JSON.stringify(error))
            })  
          


    Orientation.addOrientationListener(this._updateOrientation)
    Orientation.addSpecificOrientationListener(this._updateSpecificOrientation)
  }

  componentWillUnmount() {
    Orientation.removeOrientationListener(this._updateOrientation)
    Orientation.removeSpecificOrientationListener(this._updateSpecificOrientation)
  }

  _updateOrientation = orientation => this.setState({ orientation })
  _updateSpecificOrientation = specificOrientation => this.setState({ specificOrientation })

  loadStart(data) {
    console.log('loadStart', data)
  }

  setDuration(duration) {
    this.setState({duration: duration.duration})
  }

  setTime(data) {
    let sliderValue = parseInt(this.state.currentTime)
    this.setState({
      slideValue: sliderValue,
      currentTime: data.currentTime,
      modalVisible: false
    })
  }

  onEnd(data) {
    this.player.seek(0)
  }

  videoError(error) {
    this.showMessageBar('播放器报错啦！')(error.error.domain)('error')
    this.setState({
      modalVisible: false
    })
  }

  onBuffer(data) {
    console.log('onBuffer', data)
  }

  onTimedMetadata(data) {
    console.log('onTimedMetadata', data)
  }

  showMessageBar = title => msg => type => {
    // MessageBarManager.showAlert({
    //   title: title,
    //   message: msg,
    //   alertType: type,
    // })
  }

  play() {
    this.setState({
      paused: !this.state.paused,
      playIcon: this.state.paused ? 'music_paused_o' : 'music_playing_s'
    })
  }

  renderModal() {
    return (
      <Modal
        animationType={"none"}
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => alert("Modal has been closed.")}
      >
        <View style={styles.indicator}>
          <ActivityIndicator
            animating={true}
            style={[{height: 80}]}
            color={commonStyle.red}
            size="large"
          />
        </View>
      </Modal>
    )
  }

  onFullScreen(status) {
    // Set the params to pass in fullscreen status to navigationOptions
    this.props.navigation.setParams({
      fullscreen: !status
    })
  }

  renderItem = ({item}) => {
    return(
        <View style={{justifyContent:'flex-start',flexDirection:'row'}}>
                       
                        <View style={{margin:10}}>
                            <Image source={{uri:item.thumbnail}} style={{width:screenWidth*0.35, height:80}} />
                           
                        </View>

                        <View style={{marginTop:15}}>
                            <Text style={{fontSize:15, lineHeight:25, color:sys.titleColor}}>{item.title}</Text>
                            <Text style={{fontSize:13, lineHeight:25, color:sys.subTitleColor}}>{"金币:"+item.gold}</Text>
                        </View>
                    </View>
    )
    }

    keyExtractor = (item, index) => index + '';
    
    renderHeader(){
        return (
        <View style={{marginLeft:10,marginTop:10,height:30}}>
        <Text style={{fontSize:20, fontWeight:'bold',lineHeight:25, color:sys.titleColor}}>猜你喜欢</Text>
       </View>)
    }

    onMorePress(){
        this.props.navigation.goBack()
    }

  render() {
    const {orientation, isLock} = this.state
    const url = 'http://flv3.bn.netease.com/tvmrepo/2018/6/H/9/EDJTRBEH9/SD/EDJTRBEH9-mobile.mp4'
    const logo = 'https://your-url.com/logo.png'
    const placeholder = 'https://your-url.com/placeholder.png'
    const title = 'My video title'
    // Alert.alert(JSON.stringify(this.state.params?this.state.params.url:"nihao"));
    return (
          <View style={styles.container}>
            <Video
              autoPlay
              url={this.state.params?this.state.params.url:url}
              title={this.state.params?this.state.params.title:"nihao"}
              logo={logo}
              placeholder={this.state.params?this.state.params.thumbnail:placeholder}
              onMorePress={() => this.onMorePress()}
              onFullScreen={status => this.onFullScreen(status)}
              //rotateToFullScreen
            />
            <RefreshListView
            data={this.state.sourceData}
            keyExtractor={this.keyExtractor}
            renderItem={this.renderItem}
            //refreshState={this.state.refreshState}
            onHeaderRefresh={()=>{}}
            //onFooterRefresh={this.onFooterRefresh}
            ListHeaderComponent={this.renderHeader}
  
            // 可选
            footerRefreshingText='玩命加载中 >.<'
            footerFailureText='我擦嘞，居然失败了 =.=!'
            footerNoMoreDataText='-我是有底线的-'
            footerEmptyDataText='-好像什么东西都没有-'
          />
          </View>
        )
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
      },  
  movieContainer: {
    // justifyContent: 'space-between'
  },
  videoPlayer: {
    position: 'absolute',
    top: 44,
    left: 0,
    bottom: 0,
    right: 0,
  },
  navContentStyle: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: commonStyle.black
  },
  toolBarStyle: {
    backgroundColor: commonStyle.black,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    marginTop: 10,
    height: 30
  },
  timeStyle: {
    width: 35,
    color: commonStyle.white,
    fontSize: 12
  },
  slider: {
    flex: 1,
    marginHorizontal: 5,
    height: 20
  },
  progressStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 10
  },
  indicator: {
    height: playerHeight,
    width: deviceInfo.deviceWidth,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navToolBar: {
    backgroundColor: commonStyle.clear,
    marginHorizontal: 5
  }
})