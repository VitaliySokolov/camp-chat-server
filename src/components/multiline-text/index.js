import React from 'react';
import PropTypes from 'prop-types';
import ReactEmoji from 'react-emoji';

const MultilineText
    = props =>
        <div className="multilines">
            {props.text && props.text.split('\n').map((line, index) => <div key={index}>{
                ReactEmoji.emojify(line)
            }</div>)}
        </div>;

MultilineText.propTypes = {
    text: PropTypes.string
};

export default MultilineText;
