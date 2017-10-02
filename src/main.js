/**
 * 后台主界面组件 新手请注意，前方高能，请保重
 * @author yangyunlong
 */
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './main.css';
import './static/api';
import menus from './menus';
import Order from './order/order';
const token = localStorage.getItem('token');
//界面头部组件
class Header extends Component {
    constructor(props) {super(props);}
    render() {
        return (
            <div id='main-header'>
                <div id="main-hleft">速洗达商家管理系统</div>
                <div id="main-hright">
                    <span id="main-feedback">意见反馈</span>
                    <span id="main-password">修改密码</span>
                    <input type="button" value="退出" id="main-logout"/>
                </div>
            </div>
        );
    }
}
//界面主体容器组件
class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name:null,status:null,logo:null,orders:null,amount:null,count:null,    //数据状态
            option:null,menu:null,    //菜单栏样式状态
            e:this.props.children    //右侧展示样式状态
        };
        this.monitorMenu = this.monitorMenu.bind(this);
        this.handleContainerView = this.handleContainerView.bind(this);
        //注册组件列表
        this.elements = {
            index:Index,
            order:Order
        };
    }
    //获取店铺状态数据
    componentDidMount() {
        axios.post(api.U('index'),api.data({token:this.props.token}))
        .then((response)=>{
            let result = response.data.data;
            this.setState({
                name:result.mname,    //店铺名称
                status:result.state,    //店铺状态
                logo:'url(' +api.host+result.circle_logo+ ')',    //店铺头像
                orders:result.will_dispose,    //店铺待处理订单数
                amount:result.total,    //营业总额
                count:result.order_count    //有效订单
            });         
        });
    }

    monitorMenu(menu) {    //左侧菜单展开收起效果事件方法
        if (this.state.menu == menu) menu = null;
        this.setState({menu:menu});
    }

    handleContainerView(e) {    //右侧界面动态转换事件方法
        let element = e.target.dataset.e,
            option = e.target.dataset.option;
        if (
            'undefined' !== typeof element     //防止未注册组件崩溃
            && 
            this.state.e != element
        ) this.setState({e:element});

        if ('undefined' !== typeof option) this.setState({option:option});    //防止未注册菜单项
    }

    render() {
        let state = this.state,
            props = this.props,
            menusList = menus.map((obj) =>     //创建多个菜单组件
            <Menu 
                key={obj.id} 
                id={obj.id} 
                orders={state.orders}
                selection={obj.selection} 
                options={obj.options} 
                menu={state.menu}
                option={state.option}
                parentMonitorMenu={this.monitorMenu}
                changeView={this.handleContainerView}
            />
        );
        const E = this.elements[state.e],    //展示指定视图组件
              mainStyle = {
                  height:'100%',width:'100%',
                  display:'flex',display:'-webkit-flex',
                  justifyContent:'space-between'
              };
        return (
            <div style={mainStyle}>
                {/* 左侧菜单栏容器 */}
                <aside id='main-sidebar'>
                     {/* 信息展示组件 */}
                    <Base token={props.token} name={state.name} status={state.status} logo={state.logo}/>
                    {/* 导航容器组件及导航栏视图组件 */}
                    <div id='main-nav'>{menusList}</div>
                </aside>
                {/* 右侧视图容器 */}
                <div id='main-container'>
                    {/* 视图组件 */}
                    <E amount={state.amount} count={state.count} changeView={this.handleContainerView}/>
                </div>
            </div>
        );
    }
}
//侧边栏信息状态视图组件
class Base extends Component {
    constructor(props) {
        super(props);
        this.state = {status:null};
        this.statusSwitchover = this.statusSwitchover.bind(this);
    }
    statusSwitchover() {
        //操作当前店铺状态时，获取当前店铺状态并取反
        let status = this.state.status,
            pstatus = this.props.status,
            state = null == status ? (1 == pstatus ? 3 : 1) : (1 == status ? 3 : 1);
        axios.post(api.U('statusSwitchover'),api.data({token:this.props.token,state:state}))
        .then((response) => {
            if (api.verify(response.data)) this.setState({status:state});
        });
    }
    render() {
        let props = this.props,
            status = this.state.status,
            isOpen = null == status ? (1 == props.status) : (1 == status),
            bg = isOpen ? 'main-open' : 'main-close',
            word = isOpen ? '营业中' : '暂停营业';
        return (
            <div id='main-base'>
                <div id="main-logo" style={{backgroundImage:props.logo}}></div>
                <div id="main-name">{props.name}</div>
                <div id="main-state" onClick={this.statusSwitchover} className={bg}>{word}</div>
            </div>
        );
    }
}
//菜单视图组件
class Menu extends Component {
    constructor(props) {
        super(props);
        this.chooseMenu = this.chooseMenu.bind(this);
    }
    chooseMenu(e) {this.props.parentMonitorMenu(this.props.id);}
    render() {
        let props = this.props,
            sel = props.selection,
            opt = props.options,
            isShowOrders = 'order' == sel.id && props.orders > 0,
            isSpread = props.id == props.menu,
            status = isSpread ? 'main-spread' : 'main-shrink',    //判断当前大选项是否为选中状态
            optStatus = {display:isSpread ? 'block' : 'none'},
            items = opt.map((obj) => 
                //创建多个选项
                <nav 
                    key={obj.id} 
                    data-option={obj.id} 
                    data-e={obj.e}
                    className={props.option == obj.id ? 'main-chosen' : null} 
                    onClick={this.props.changeView}
                >
                    {obj.text}
                    {isShowOrders && '订单处理' == obj.text? <em className='main-tag'>{props.orders}</em> : ''}
                </nav>
            );
        return (
            <dl>
                <dt onClick={this.chooseMenu} className='main-selection'>
                    <div id={sel.id}>{sel.text}</div>
                    <div className={status}></div>
                </dt>
                <dd className='main-option' style={optStatus}>{items}</dd>
            </dl>
        );
    }
}
//首页右侧展示
class Index extends Component {
    constructor(props) {super(props);}
    render() {
        let props = this.props,
            count = props.count,
            amount = props.amount,
            amountArr = String(amount).split('.'),    //拆分价格显示
            chatStyle = {height:'306px',background:'grey',borderRadius:'5px',width:'100%'},
            wordStyle = {marginTop:'40px',fontSize:'18px'};
        if ('undefined' == typeof amountArr[1]) amountArr[1] = '00'
        return (
            <div style={{padding: '30px 30px 0 30px'}}>
                <section style={chatStyle}></section>
                <section className='main-word'>
                    今日营业总额：
                    <span className='main-word-larger'>{amountArr[0] + '.'}</span>
                    <span>{amountArr[1]}</span>
                </section>
                <section className='main-word'>
                    今日有效订单：<span className='main-word-larger'>{amount}</span>
                </section>
            </div>
        );
    }
}

ReactDOM.render(<Header/>,document.getElementsByTagName('header')[0]);
ReactDOM.render(<Main token={token}>index</Main>,document.getElementById('main'));
/* 样式原因，所有组件根节点都要使用div */