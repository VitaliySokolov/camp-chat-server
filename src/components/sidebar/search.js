import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
// import IconButton from 'material-ui/IconButton';

/* const SearchInput_ = (props) => (
  <input name="search" type="search" value=""
    className="sidebar-search__input" placeholder="search..." />
);

const SearchButton_ = (props) => (
  <button className="sidebar-search__btn">
    <img src="/img/search.png" alt="s" />
  </button>
)*/

const SearchInput = props =>
    <TextField
        hintText="search..."
        hintStyle={{
            color: 'rgba(255, 255, 255, .5)'
        }}
        floatingLabelFixed={false}
        inputStyle={{
            color: '#fff'
        }}
    />

    ;

class SidebarSearch extends Component {
    render () {
        return (
            <div className="sidebar-search">
                <SearchInput>
                </SearchInput>
            </div>
        );
    }
}

export default SidebarSearch;
