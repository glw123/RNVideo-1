import React, { PureComponent } from 'react'
import {
    FlatList,
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    Animated,
    ImageBackground,
    Easing,
    StyleSheet,
    Alert,
    TouchableWithoutFeedback
} from 'react-native'
import ajax from '../utils/fetch'
import Toast, { DURATION } from 'react-native-easy-toast'
import Video from 'react-native-video'

const {width: screenWidth, height: screenHeight} = Dimensions.get('window')
import { Platform, NativeModules } from 'react-native';
const { StatusBarManager } = NativeModules;
 
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;


export default class Live extends PureComponent {


    constructor(props) {
        super(props);
        
        this.state = {
            sourceData: [],
            refreshing: false,
            flatHeight: 0,
            isPause: false,
            current:0,
        }
        this._onViewableItemsChanged = this._onViewableItemsChanged.bind(this)
    }


    currPage = 0
    rotateDeg = new Animated.Value(0)
    _this = null;
    _getNewsData = () => {
        _this = this
        let requestCode = this.props.requestCode

        ajax({
            url:`http://c.3g.163.com/nc/video/home/1-10.html`,
            success: (data) => {
                data['videoList'][0].length = 61

                _this.setState({
                    sourceData: _this.state.refreshing ? data['videoList'] : [...this.state.sourceData, ...data['videoList']]
                })
                _this.currPage += 10
            },
            error: (err) => {
                _this.refs.toast.show('网络请求异常')
            },
            complete: () => {
                _this.state.refreshing && _this.setState({
                    refreshing: false
                })
            }
        })
    }

    _keyExtractor = (item, index) => index + ''

    _onPressItem = (item) => {
        this.props.navigation.push('VideoDetail', {item})
    }

    //跳转到指定位置
    _doActionToItem = () => {
        this.flatList.scrollToIndex({
            viewPosition: 0, //指定选定行显示的位置，0代表top，0.5代表middle，1代表bottom
            index: this.state.indexText,
        })
    }

    //跳转到内容最底部
    _doActionToBottom = () => {
        this.flatList.scrollToEnd()
    }

    // 空布局
    _renderEmptyView = () => {
        return(
            <View style={{height: this.state.flatHeight, backgroundColor: '#F8F8F8', justifyContent: 'center', alignItems: 'center', marginTop:20}}>
                <Image source={require('./../../assets/images/list_placeholder.png')} resizeMode={'contain'} style={{width: 80, height: 60}} />
            </View>
        )
    };

    _renderFooter = () => {
        let len = this.state.sourceData.length
        const spin = this.rotateDeg.interpolate({
            inputRange: [0,1],
            outputRange: ['0deg', '360deg'],
        })
        return (
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems:'center', height:len<1?0:40}}>
                <Animated.Image source={require('./../../assets/images/i_loading.gif')} resizeMode={'contain'} style={{width:20, height:len<1?0:40, marginRight:5, transform:[{rotate: spin}]}} />
                <Text>正在加载...</Text>
            </View>
        )
    }

    //开始loading动画
    _spin = () => {
        this.rotateDeg.setValue(0)
        Animated.timing(
            this.rotateDeg,
            {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
            }
        ).start()
    }

    //分割线
    _renderItemSeparatorComponent = ({highlighted}) => {
        return(
            <View style={{height:1, backgroundColor:'#e6e6e6'}}></View>
        )
    }

    //下拉刷新
    _renderRefresh = () => {
        this.setState({
            refreshing: true
        })
        this.currPage = 0
        this._getNewsData()
    }

    //上拉加载更多
    _onEndReach = () => {
        this._getNewsData()
    }

    _renderItem = ({item,index}) => {
        return(
            <ImageBackground 
            source={{uri:item.thumbnail}}
            style={{flex:1,width:screenWidth,height:screenHeight-49}}>
                <TouchableWithoutFeedback  style={{backgroundColor:'blue'}} onPress={()=>{
                    this.setState({
                        isPause:!this.state.isPause,
                    },()=>{
                       
                    })
                    
                }}>
                    <Video ref={(ref) => {this.videoRef = ref}}
                           source={{uri:item.mp4_url}}
                           style={{flex: 1,backgroundColor:'#000'}}
                           repeat={true}
                           paused={index===this.state.current?this.state.isPause:true}
                           resizeMode='contain'
                    >
                    </Video>
                </TouchableWithoutFeedback>
            </ImageBackground>
        )
    }

    // _setFlatListHeight = (e) => {
    //     let height = e.nativeEvent.layout.height
    //     if (this.state.flatHeight < height) {
    //         this.setState({
    //             flatHeight: height
    //         })
    //     }
    // }

    componentDidMount() {
        this._getNewsData()
    }

    render(){
        const VIEWABILITY_CONFIG = {
    		viewAreaCoveragePercentThreshold: 80,//item滑动80%部分才会到下一个
		};
        return(
            <View style={styles.container}>
                  <FlatList
                  data={this.state.sourceData}
                  renderItem={this._renderItem}
                  horizontal={false}
                  pagingEnabled={true}
                  getItemLayout={(data, index) => {
                      return {length: (screenHeight-49), offset:  (screenHeight-49) * index, index}
                  }}
                  keyExtractor={(item, index) => index.toString()}
       
                  showsHorizontalScrollIndicator={false}
                  onViewableItemsChanged={this._onViewableItemsChanged}
              />
                <Toast
                    ref='toast'
                    style={{backgroundColor:'black'}}
                    position='center'
                    opacity={0.8}
                    textStyle={{color:'white'}}
                />
            </View>
        )
    }

    _onViewableItemsChanged({viewableItems, changed}) {
		//这个方法为了让state对应当前呈现在页面上的item的播放器的state
		//也就是只会有一个播放器播放，而不会每个item都播放
		//可以理解为，只要不是当前再页面上的item 它的状态就应该暂停
        //只有100%呈现再页面上的item（只会有一个）它的播放器是播放状态
        
        if(viewableItems.length === 1){
            _this.setState({
                current:viewableItems[0].index,
            })
        }
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    }
})
