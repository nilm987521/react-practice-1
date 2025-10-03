import React from 'react';
import './Square.css'

export default function Square(props) {
    return (
        <div className="square" onClick={props.onClick}>
            {props.value}
        </div>
    );
}

// export default class Square extends React.Component {
//     render() {
//         return (
//             <div className="square" onClick={this.props.onClick}>
//                 {this.props.value}
//             </div>
//         );
//     }
// }