<template>
	<view id="page" class="uni-im-index">
		

		<!-- 会话列表 -->
		<view id="center-view">
			  <!-- 会话用户列表 -->
			  <uni-im-conversation-list 
				ref="uni-im-conversation-list" @clickItem="toChat($event.id)"
				@change="conversationList = $event" :active-conversation-id="currentConversationId"
				id="conversation-list-box"
			  ></uni-im-conversation-list>
		</view>

		
	</view>
</template>

<script>
  import {markRaw} from "vue";
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	import contacts from '@/uni_modules/uni-im/pages/contacts/contacts';

	

	let lastConversationId = false
	export default {
		
		data() {
			return {
        extIndexMenu: uniIm.extensions.invokeExts("index-page-menu").map(i=>markRaw(i.component)),
				users: {},
				dynamicComponentName: 'uni-im-addPeopleGroups', //通过动态组件引入页面在pc端显示
				view2Title: '加人/加群',
				contactsViewIsShow: false,
				chatInfoIsShow: false,
				currentConversation: {},
        keyword:'',
        conversationList: [],
        filteredConversationId: false, // 仅显示匹配的聊天记录的会话
			};
		},
		computed: {
			// 导入uniIm响应式数据，支持别名：比如:['a as b']
			...uniIm.mapState(['currentConversationId', 'isWidescreen']),
			unreadMsgCount() {
				return uniIm.conversation.unreadCount()
			},
			unreadnotificationCount() {
				return uniIm.notification.unreadCount()
			},
			avatarUrl() {
				return uniIm.currentUser?.avatar_file?.url || '/uni_modules/uni-im/static/avatarUrl.png'
			}
		},
		watch: {
			unreadMsgCount: {
				handler(unreadMsgCount) {
					// console.log({
					// 	unreadMsgCount
					// });

					// #ifdef APP
					plus.runtime.setBadgeNumber(unreadMsgCount)
					// #endif
					uniIm.utils.setTabBarBadge(2, unreadMsgCount)

					// 调用扩展点，更新未读消息总数。
					uniIm.extensions.invokeExts('ui-update-unread-count', unreadMsgCount)
				},
				immediate: true,
			},
			contactsViewIsShow(contactsViewIsShow) {
				if (contactsViewIsShow) {
					lastConversationId = this.currentConversationId
					uniIm.currentConversationId = false
				} else {
					if (lastConversationId) {
						uniIm.currentConversationId = lastConversationId
						this.$nextTick(() => {
							this.toChat(lastConversationId)
						})
					}
				}
			},
      //  根据当前会话id，设置会话对象
			async currentConversationId(id) {
        if(id){
          this.currentConversation = await uniIm.conversation.get(id)
          // 如果是被隐藏的会话，取消隐藏
          if(this.currentConversation.hidden){
            this.currentConversation.hidden = false
          }
        }
			}
		},
		async onLoad(param) {
      console.log('onLoad',param)
      /**
       * 打开index页面之前的扩展点，用于自己扩展登录等逻辑
       */
      await Promise.all(uniIm.extensions.invokeExts('index-load-before-extra', param))
      
      const {tokenExpired} = uniIm.currentUser
      if (tokenExpired < Date.now()) {
      	console.info('当前用户的登录状态无效，将自动跳转至登录页面。', param)
      	let url = '/uni_modules/uni-id-pages/pages/login/login-withpwd?uniIdRedirectUrl='
      	let paramString = '/uni_modules/uni-im/pages/index/index?'
      	for (let key in param) {
      		paramString += `${key}=${param[key]}&`
      	}
      	paramString = paramString.substring(0, paramString.length - 1) //携带参数，实现登录成功后 跳回首页时传回
      	url += encodeURIComponent(paramString)
      	return uni.redirectTo({
      		url
      	})
      }
      
      uniIm.onInitDataAfter(()=>{
        // console.log('onUniImInitDataAfter');
        // 执行当前页面初始化
        this.init(param)
      })
			// #ifdef H5
			// 去掉链接后面的参数且不刷新
			history.replaceState(null, '', window.location.href.split('?')[0])
			// #endif
		},
    mounted(){
      this.$refs['uni-im-conversation-list'].loadMore()
    },
		async onReady() {
      uni.$on('uni-im-toChat', param => {
      	if (param) {
      		// 关闭最后一次的会话id，防止切回后重新显示最后一次会话，而指定显示到某个会话
      		lastConversationId = false
      		this.toChat(param)
      	}
      	this.contactsViewIsShow = false
      })
			// #ifdef H5
      const deviceInfo = uni.getDeviceInfo()
      if(deviceInfo.deviceType === 'pc'){
        // about PWA start -
        // 判断用户是否已经要求不再显示安装PWA的提示
        const isNotShowInstallPWAPrompt = uni.getStorageSync('uni-im-data:isNotShowInstallPWAPrompt')
        if(!isNotShowInstallPWAPrompt){
          const mediaQuery = window.matchMedia('(display-mode: standalone)');
          function handleMediaChange(event) {
            // console.error('standalone',event.matches)
            if (event.matches) {
              document.body.classList.add('isPWA')
            } else {
              document.body.classList.remove('isPWA')
              // console.error('window.installPWAPrompt',window.installPWAPrompt)
              if(window.installPWAPrompt){
                uni.showModal({
                  content: '仅需 1 秒，即可快速安装本应用桌面端，畅享更好的体验。',
                  cancelText: '不再提醒',
                  confirmText: '安装',
                  success: (res) => {
                    if (res.confirm) {
                      window.installPWAPrompt.prompt();
                    }else{
                      console.error('不再提醒');
                      uni.setStorage({
                        key: 'uni-im-data:isNotShowInstallPWAPrompt',
                        data: true
                      })
                    }
                  }
                });
              }
            }
          }
          mediaQuery.addListener(handleMediaChange);
          handleMediaChange(mediaQuery);
        }
        // about PWA end -
        
        
        const centerView = document.querySelector('#center-view')
        const indexCenterViewWidth = uni.getStorageSync('uni-im-data:indexCenterViewWidth') || "380px"
        centerView.style.width = indexCenterViewWidth
        // 拖动center-view的 伪元素 after 来调整center-view的宽度
        const resizeLine = document.createElement('div')
        resizeLine.className = 'resize-line'
        resizeLine.style = `
          position: absolute;
          top: 0;
          right: 0;
          width: 3px;
          height: 100%;
          cursor: col-resize;
        `;
        centerView.appendChild(resizeLine)
        resizeLine.addEventListener('mousedown', (e) => {
          e.preventDefault()
          let startX = e.clientX
          let startWidth = centerView.offsetWidth
          document.onmousemove = (e) => {
            let moveX = e.clientX - startX
            const newWidth = startWidth + moveX
            if(newWidth > 550){
              // 改变鼠标样式，为向左箭头
              document.body.style.cursor = 'w-resize';
            }else if(newWidth < 200){
              // 改变鼠标样式，为向右箭头
              document.body.style.cursor = 'e-resize';
            }else{
              centerView.style.width = newWidth + 'px'
              uni.setStorage({
                key: 'uni-im-data:indexCenterViewWidth',
                data: centerView.style.width
              })
            }
          }
          document.onmouseup = () => {
            document.body.style.cursor = '';
            document.onmousemove = null
            document.onmouseup = null
          }
        })
        const shortcutKeyFn = (keyName,event)=>{
          const index = this.conversationList.findIndex(item=>item.id == this.currentConversationId)
          if(keyName == 'ArrowUp' && index > 0){
            this.toChat( this.conversationList[index - 1].id )
            event.preventDefault();
          }else if(keyName == 'ArrowDown' && index < this.conversationList.length){
            this.toChat( this.conversationList[index + 1].id )
            event.preventDefault();
          }
        }
        uniIm.utils.shortcutKey.withMeta(shortcutKeyFn)
        uniIm.utils.shortcutKey.withCtrl(shortcutKeyFn)
        
        if (!window.chrome && (deviceInfo.deviceType === 'pc' || deviceInfo.platform != 'ios')) {
          let newElement = document.createElement('div')
          newElement.innerHTML = `
          <div id="tip-browser-compatibility" style="background: #fff9ea;color: #ff9a43;position: fixed;top: 0;left: 0;width: 100vw;padding: 15px;font-size: 18px;">
          	注意：本系统仅兼容chrome内核的浏览器，其他浏览器可能出现异常。<a href="https://www.google.cn/chrome/">点此下载chrome浏览器</a>
          </div>
          `
          document.body.appendChild(newElement)
        }
      }
			// #endif
		},
		onUnload() {
		},
    onBackPress(e) {
      const clRef = this.$refs['uni-im-conversation-list']
      if(clRef.focusConversationId){
        clRef.closeConversationMenu()
        return true
      }
    },
		onHide() {},
		methods: {
			clickMenu(data) {
				// console.log('79879789798898798978789', data);
				this.dynamicComponentName = data.componentName

				if (data.title) {
					this.view2Title = data.title
				}

        this.$nextTick(() => {
        	this.$refs.dynamicComponent.setParam(data.param || {})
          if (data.componentName == 'uni-im-createGroup') {
            this.$refs.dynamicComponent.getFriendsData()
          }
        })
				// console.log('data.componentName----',data.componentName);
			},
      /**
       * @description 根据群id，申请加入群聊
       * @param {Object} 群id
       */
      joinGroup(group_id){
        console.log('group_id',group_id);
        const db = uniCloud.database();
        uni.showLoading({
          title: '正在申请加群...',
          mask: true
        });
        db.collection('uni-im-group-join').add({
        	group_id,
        	"message":''
        }).then((res) => {
        	console.log("res: ",res);
          if(res.result.isPass){
            this.toChat("group_" + group_id)
          }else{
            uni.showToast({
            	icon: 'none',
            	title: '已提交加群申请，等待管理员审核'
            })
          }
        }).catch((err) => {
        	if(err.code === 10001){
            console.log('已经是群成员 直接打开对应页面');
        		return this.toChat("group_" + group_id)
        	}
        	uni.showModal({
        		content: err.message || '请求服务失败',
        		showCancel: false
        	})
        })
        .finally(()=>{
          uni.hideLoading()
        })
      },
      // #ifdef H5
      beforeJoinGroup(){
        let group_id = prompt("请输入群id", "");
        if (group_id) {
          this.joinGroup(group_id)
        }
      },
      // #endif
			readQrCode() {
				uni.scanCode({
					complete: (e) => {
						// console.log(e);
						try {
							let data = JSON.parse(e.result)
							// console.log(data);
							if (data.type == 'uni-im' && data.subType == "groupInfo") {
							}
						} catch (e) {
						}
					}
				})
			},
			async init({
				conversation_id,
				goods,
				user_id,
        joinGroup
			}) {
        // console.log('init', {
        //   conversation_id,
        //   goods,
        //   user_id
        // });
        if(user_id || conversation_id){
          this.toChat(conversation_id || {user_id})
        }
        //  如果初始化时，指定了要访问的会话。将指定要访问的会话排序位置置顶，方便看到
        setTimeout(()=> this.currentConversation.customIndex = Date.now(), 0);
        
				//  如果列表小于30个会话，尝试着从云端拉取一次
        if( this.conversationList.length < 30 ){
          await this.$nextTick()
          await this.$refs['uni-im-conversation-list'].loadMore()
        }else{
          console.log('会话列表已满一页，需要用户自己滚动到底，再拉取更多');
        }
				
				// 传递参数goods（对象格式，包含：商品名称name，链接url。自动设置对话框默认内容
				if (this.isWidescreen && goods) {
					// console.log(goods);
					if (typeof goods != 'object') {
						goods = JSON.parse(goods)
					}
					const {
						name,
						url
					} = goods
					if (name && url) {
						setTimeout(()=>{
							this.$refs['chat-view'].chatInputContent = '【' + name + ':' + url + '】'
						}, 1000);
					}
				}
        
        /**
         * 在本页面链接传递参数 joinGroup=group_id即可申请加入群，
         * 比如：http://localhost:8082/#/uni_modules/uni-im/pages/index/index?joinGroup=xxx
         */ 
        if(joinGroup){
          this.joinGroup(joinGroup)
        };
			},
			search(e) {
				// console.log("search-e: " + JSON.stringify(e));
				uni.showToast({
					title: '加好友功能入口，暂时在左侧菜单的通讯录中',
					icon: 'none',
					duration: 3000
				});
			},
			addUser() {
				uni.showToast({
					title: '加好友功能入口，暂时在左侧菜单的通讯录中',
					icon: 'none',
					duration: 3000
				});
			},
      showChatView() {
        this.contactsViewIsShow = false
        // 拿到所有存在未读消息的会话对象
        const ucId = uniIm.conversation.dataList
                          .filter(item => item.unread_count > 0)
                          .filter(item => !item.mute)
                          .map(item => item.id)
        if(ucId.length > 0){
          let index = ucId.findIndex(item => item == this.currentConversation.id)
          // 如果当前会话存在未读消息，则切换到下一个会话。如果当前会话不存在未读消息，则切换到第一个存在未读消息的会话
          index >= 0 ? index ++ : index = 0;
          this.toChat(ucId[index])
        }
      },
      showContactsView() {
        this.contactsViewIsShow = true
        // 判断是不是第一次打开
        if(!this.showContactsView.firstOpen){
          this.showContactsView.firstOpen = true
          this.$nextTick(() => {
            const contactsRef = this.$refs['uni-im-contacts']
            contactsRef.openPages(contactsRef.menuList[0])
          })
        }
      },
      toChatFiltered({ conversation_id, count, keyword }) {
        this.chatInfoIsShow = false;
        this.filteredConversationId = conversation_id
        uniIm.currentConversationId = conversation_id

        if (this.isWidescreen) { // 若为宽屏，则切换右侧的组件
          this.$nextTick(() => {
            let chatFilteredRef = this.$refs['chat-filtered']
            if (chatFilteredRef) {
              chatFilteredRef.load({
                conversation_id,
                keyword,
                count,
              })
            }
          })
        } else { // 若为窄屏，则打开新窗体
          uni.navigateTo({
            url: '/uni_modules/uni-im/pages/chat/chat-filtered'
                  + `?conversation_id=${conversation_id}`
                  + `&keyword=${encodeURIComponent(keyword)}`
                  + `&count=${count}`,
            animationDuration: 300
          })
        }
      },
      async toChat(param) {
        this.chatInfoIsShow = false;
        this.keyword = ''
        this.filteredConversationId = false
        const {id} = await uniIm.conversation.get(param)
        uniIm.currentConversationId = id
        if (this.isWidescreen) { // 若为宽屏，则切换右侧的组件
          this.$nextTick(() => {
            let chatViewRef = this.$refs['chat-view']
            if (chatViewRef) {
              chatViewRef.load(id)
            }
          })
        } else { // 若为窄屏，则打开新窗体
          // param 转成字符串
          uni.navigateTo({
            url: '/uni_modules/uni-im/pages/chat/chat?conversation_id=' + id,
            animationDuration: 300
          })
        }
      },
			showChatInfo() {
				this.chatInfoIsShow = !this.chatInfoIsShow
        if(this.chatInfoIsShow){
          this.$nextTick(()=>{
            if(this.currentConversation.group_id){
              this.$refs['group-info'].load(this.currentConversation.id)
            }else{
              this.$refs['chat-info'].load(this.currentConversation)
            }
          })
        }
			},
			toUcenter() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo?showLoginManage=true',
					complete(e) {
						// console.log("e: " + JSON.stringify(e));
					}
				})
			},
      openConversationMenu(e,name){
        const myContextmenu = this.$refs['uni-im-contextmenu']
        let menuList = []
        if(name == 'unreadMsgCount' && this.unreadMsgCount > 0){
          menuList.push({
            "title": "清空所有未读消息数",
            "action": () => {
              console.log('清空所有未读消息数')
              uniIm.conversation.clearUnreadCount()
            }
          })
        }
        if(menuList.length == 0){
          return
        }
        console.log('menuList.length',menuList.length)
        myContextmenu.show({
          "top": e.clientY + 35,
          "left": e.clientX
        }, menuList)
        // myContextmenu.onClose(() => {
        //   console.log('关闭右键菜单')
        // })
      }
		},
		async onReachBottom() {
			await this.$refs['uni-im-conversation-list']?.loadMore()
		},
		onNavigationBarButtonTap() {
      uni.navigateTo({
      	url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo?showLoginManage=true',
      	complete: e => {
      		// console.log(e);
      	}
      });
		}
	}
</script>

<style lang="scss">
  @import "@/uni_modules/uni-im/common/baseStyle.scss";
  @import "@/uni_modules/uni-im/pages/index/index.scss";
</style>