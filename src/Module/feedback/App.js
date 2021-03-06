/**
 * 用户反馈弹窗组件
 * @author yangyunlong
 */
import React from 'react';
import './App.css';
export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {content:''};
        this.onConfirm = this.onConfirm.bind(this);
    }

    onConfirm() {
        axios.post(api.U('feedback'),api.D({token:this.props.token,content:this.state.content}))
        .then((response) => {
            if (api.V(response.data)) {
                this.setState({content:'',len:0});
            }
        });
    }

    render() {
        return (
                <div className='fb'>
                    <div>
                        <textarea 
                            placeholder='意见反馈需小于100字' 
                            maxLength='100' 
                            value={this.state.content}
                            onChange={e => this.setState({content:e.target.value})}
                        ></textarea>
                        <i className='m-counter'>{this.state.content.length}/100</i>
                    </div>
                    <div>
                        <input type='button' value='确认' className='m-btn confirm large'onClick={this.onConfirm}/>
                    </div>
                </div>
        );
    }
}