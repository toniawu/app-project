<template>
	<view style="height: 100%">
		<view style="height: 45%">
			<map style="height: 250px;width: 100vw;" :longitude="longitude" :latitude="latitude"
			:scale = "scale"
			:markers="markers"
			:polyline="polyline"
			@markertap="tapMarker"
			></map>
		</view>
		
		<view style="height: 55%">
			<view  v-for="item in hospitalList">
				<div class="content">
					<div class="contentLeft">
						<image 
							style="margin-right: 5px;"
							mode="aspectFit" 
							:src="item.url"
							class="leftImg"
						></image>
					</div>
					<div class="contentMid">
						<h3>{{item.name}}</h3>
						<p class="remark">
							<p>{{item.desc}}</p>
						</p>
						<!-- <div style="flex-direction:row;display: flex;margin-top: 12px;">
							<div style="flex:1"></div>
							<image style="width: 20px; height: 20px;margin-right: 30px;"
							mode="aspectFit" src="/static/map/go.png"
							></image>
						</div> -->
						<div style="flex:1"></div>
					</div>
					
				</div>
			</view>
		</view>
		
	</view>
</template>

<script>
	const hosPos = uniCloud.importObject('hospital-position')
	export default {
		data() {
			return {
				hospitals:[],
				polyline:[],
				hospitalList:[],
				includeP:[],
				tempIncludeP:[],
				latitude: 40.113806,
				longitude: 116.391558,
				scale: 5,
				markers:  [],
				tempMarkers:  []
			}
		},
		mounted() {
		},
		onLoad() {
			
			const that = this
			
			uni.authorize({
			      scope: 'scope.userLocation',
			      success() {
			        console.log('获取位置授权成功')
			        // 获取当前位置
			        uni.getLocation({
			          type: 'gcj02', // 返回可以用于 wx.openLocation 的经纬度
			          success(res) {
						
						let result = res
						
						this.latitude = result.latitude
						this.longitude = result.longitude
						
						that.getNeareatPos(result)
						
			            // 可以在此处显示或者处理位置
			          },
			          fail(err) {
			            console.log('获取位置失败',err);
			          }
			        });
			      },
			      fail() {
			        console.log('用户拒绝授权');
			      }
			    });
		
		},
		methods: {
			tapMarker(mkId){
				this.polyline = []
				let pl = {
					points:[],
					color:"#00ff00",
					width:4
				}
				if(mkId.markerId>0){
					let pos = this.includeP[mkId.markerId]
					pl.points.push(
						{latitude: this.latitude, 
						
						longitude: this.longitude}
					)
					pl.points.push(
						{latitude: pos.latitude, 
						longitude: pos.longitude}
					)
					this.polyline.push(pl)
				}
				
			},
			
			getNeareatPos(result){				
				// let po = uni.getLocation({
				// 	type: 'gcj02',
				// 	success: function (res1) {
						// let p_x = res1.latitude
						// let p_y = res1.longitude
						let p_x = result.latitude
						let p_y =  result.longitude
						var idx = 0
						//添加本人位置
						this.tempMarkers.push({
							id: idx, 				
							latitude: p_x,
							title:"我的位置",
							longitude: p_y,
							width: 30,
							height: 30,
							iconPath:"/static/map/me3.jpg"
						})
						idx = idx+1
						this.tempIncludeP.push(
							{			 
								latitude: Number.parseFloat(p_x),
								longitude: Number.parseFloat(p_y)
							} 
						) 
						hosPos.getNeareatPos({x:p_x,y:p_y}).then((res)=>{
							if(res.code == 1){
								this.hospitals = res.data
								res.data.forEach((xx)=>{
									this.hospitalList.push({
										url:xx.hospitalImg.path,
										name:xx.name,
										desc:xx.descInfo
									})
									let px = Number.parseFloat(xx.pos_x)
									let py = Number.parseFloat(xx.pos_y)
									//添加医院位置
									this.tempMarkers.push({
										id: Number.parseInt(idx), 				
										latitude: px,
										longitude:py,
										title:xx.name,
										width: 30,
										height: 30,
										label:{
											content:xx.name
										}
									})
									this.tempIncludeP.push(
										{			
											latitude: px,
											longitude:py,
										})
									idx = idx+1
								})
								this.markers = this.tempMarkers;
								console.log(this.markers);
								this.includeP = this.tempIncludeP;
								
								console.log(this.hospitalList);
							}else{
								uni.showToast({
									duration:200,
									title: res.errMsg					
								})
							}
						}).catch(err => {
										console.log(err);
									})
									
							
					// },
					// error:function (res) {
					// 	console.log('当前位置的经度：' + res);
					// },
			// 	});
				
			},
			// 传入两地经纬度计算出距离（单位千米）
			// 纬度（lat）和经度（lon）
			// calculateDistance(lat1, lon1, lat2, lon2) {
			//   const radians = Math.PI / 180;
			//   const R = 6371; // 地球半径，单位为千米
			 
			//   const deltaLat = (lat2 - lat1) * radians;
			//   const deltaLon = (lon2 - lon1) * radians;
			 
			//   lat1 = lat1 * radians;
			//   lat2 = lat2 * radians;
			 
			//   const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
			//             Math.cos(lat1) * Math.cos(lat2) *
			//             Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
			//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			//   const distance = R * c;
			 
			//   return distance.toFixed(2);
			// },
		}
	}
</script>

<style>

.chat-custom-right {
	flex: 1;
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	flex-direction: column;
	justify-content: space-between;
	align-items: flex-end;
}

.chat-custom-text {
	font-size: 12px;
	color: #999;
}

.leftImg {
	width: 100px; /* 你想要的固定宽度 */
	height: 100%; /* 高度自适应 */
	display: block; /* 避免行内元素特有的空白间隙问题 */
	}

	.content {
		width: 100%;
		display: flex;
		height: 100px;
		margin-top: 5px;
		background-color: rgb(255,255,255);
		padding: 12px;
		box-sizing: border-box;
	}

	.contentLeft {
		flex: 3;
		margin-left: 5px;
	}
	.contentMid {
		flex: 7;
		display: flex;
		flex-direction: column;
		margin-left: 5px;
	}
	.contentRight {
		flex: 2;
		display: flex;
		flex-direction: column;
		margin-left: 10px;
	}

	.contentBottom {
		width: 100%;
		display: flex;
		justify-content: space-between;

	}

	.remark {
		font-size: 12px;
		color: #ccc;
		margin-top: 6px;
		display: flex;
		/* justify-content: space-between; */
	}

	.carCount {
		margin-left: 5px;
		margin-right: 5px;
		display: flex;
		justify-content: flex-end; 
		align-items: center; 
	}

	.shoppingCart {
		display: flex;
	}
</style>
