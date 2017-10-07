/**
 * 工艺加价组件
 * @author yangyunlong
 */
import React, {Component} from 'react';
import '../static/api';
import Crumbs, {Tabs,Math,Special} from '../static/UI';

class Craft extends Component{
    constructor(props) {
        super(props);
        this.state = {
            total:0,amount:0,freight:0,count:0,service:0,items:[],
            show:false,tempId:null
        };
        this.crumbs = [
            {text:'订单处理',key:0,e:'order'},
            {text:'添加项目',key:1,e:'item',param:this.props.param},
            {text:'工艺加价',key:2}
        ];    //面包屑参数
        this.callback = this.callback.bind(this);
        this.alertCallback = this.alertCallback.bind(this);
        this.done = this.done.bind(this);
    }
    componentDidMount() {
        let props = this.props;
        axios.post(api.U('editorPrice'),api.data({token:props.token,id:props.param}))
        .then((response) => {
            let result = response.data.data;
            this.setState({
                total:result.total,
                amount:result.amount,
                freight:result.freight,
                count:result.total_num,
                service:result.fuwu,
                items:result.list
            });
            console.log(result);
        });
    }
    callback(id) {this.setState({show:true,tempId:id});}
    alertCallback(isConfirm,object) {
        let props = this.props,
            state = this.state;
        if (isConfirm) {
            if ('' != object.special && 0 != object.special && '' != object.comment) {
                axios.post(
                    api.U('modifySpecial'),
                    api.data({token:props.token,id:state.tempId,special:object.special,special_comment:object.comment})
                )
                .then((response) => {
                    let result = response.data.data;
                    this.setState({
                        total:result.total,
                        amount:result.amount,
                        freight:result.freight,
                        count:result.total_num,
                        service:result.fuwu,
                        items:result.list
                    });
                    console.log(result);
                });
            }
            if ('' != object.hedging && 0 != object.hedging) {
                let realAmount = (object.hedging / 200).toFixed(2);
                axios.post(
                    api.U('modifyHedging'),
                    api.data({token:props.token,id:state.tempId,hedging:realAmount})
                )
                .then((response) => {
                    let result = response.data.data;
                    this.setState({
                        total:result.total,
                        amount:result.amount,
                        freight:result.freight,
                        count:result.total_num,
                        service:result.fuwu,
                        items:result.list
                    });
                    console.log(result);
                });
            }
        }
        this.setState({show:false,tempId:null});
    }
    done() {
        let props = this.props;
        axios.post(api.U('gotIt'),api.data({token:props.token,id:props.param}))
        .then((response) => {
            console.log(response.data);
            if (api.verify(response.data)) {
                props.changeView({element:'order'});
            }
        });
    }
    render() {
        let state = this.state,
            props = this.props,
            style = {flexDirection:'row-reverse'},
            style2 = {paddingRight:'56px',fontSize:'16px'},
            html = state.items.map((obj) => 
                <Row 
                    key={obj.id}
                    id={obj.id}
                    url={api.host + obj.url}
                    name={obj.name}
                    number={obj.number}
                    price={obj.price}
                    hedging={obj.hedging}
                    special={obj.special}
                    comment={obj.special_comment}
                    callback={this.callback}
                />
            );
        return (
            <div>
                <Crumbs crumbs={this.crumbs} callback={this.props.changeView}/>
                <section className='ui-container'>
                    <div className='ui-content'>
                        <table className='ui-table'>
                            <thead><tr className='ui-tr-h ui-fieldset'>
                                <td>名称</td><td>数量</td><td>价格</td><td>保值金额</td>
                                <td>保值清洗费</td><td>特殊工艺加价</td><td>备注</td><td>操作</td>
                            </tr></thead>
                            <tbody>{html}</tbody>
                        </table>
                    </div>
                    <div className='ui-content' style={style}>
                        <div>运费：<span className='ui-red'>{state.freight}</span></div>
                        <div style={style2}>价格：<span className='ui-red'>{state.amount}</span></div>
                        <div style={style2}>共<span className='ui-red'>&nbsp;{state.count}&nbsp;</span>件</div>
                    </div>
                    <div className='ui-content' style={style}>
                        <div>
                            <input 
                                type='button' 
                                value='-/+' 
                                className='ui-btn ui-btn-tab' 
                                data-param={props.param} 
                                data-e='item'
                                onClick={props.changeView}
                            />
                            &emsp;
                            <input type='button' value='确认收件' className='ui-btn ui-btn-tab' onClick={this.done}/>
                        </div>
                        <div style={{lineHeight:'42px',paddingRight:'32px',fontSize:'20px'}}>
                            总额：<span className='ui-red'>&yen;{state.total}</span>
                        </div>
                    </div>
                </section>
                <Special show={state.show} id={state.tempId} callback={this.alertCallback}/>
            </div>
        );
    }
}

class Row extends Component {
    constructor(props) {
        super(props);
        this.callback = this.callback.bind(this);
    }
    callback() {this.props.callback(this.props.id);}
    render() {
        let props = this.props,
            hasComment = '' != props.comment;
        return (
            <tr className='ui-tr-d ui-tr-p'>
                <td><img src={props.url}/>{props.name}</td>
                <td>{props.number}</td>
                <td>&yen;{props.price}</td>
                <td>&yen;{props.hedging * 200}</td>
                <td>&yen;{props.hedging}</td>
                <td>&yen;{props.special}</td>
                <td className={hasComment ? null : 'ui-grey'}>{hasComment ? props.comment : '暂无备注'}</td>
                <td><input type='button' value='编辑' className='ui-btn ui-btn-editor' onClick={this.callback}/></td>
            </tr>
        );
    }
}
export default Craft;