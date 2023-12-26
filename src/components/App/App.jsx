import React, { Component } from 'react';
import { fetchImages } from '../Api/Api';
import Searchbar from '../Searchbar/Searchbar';
import ImageGallery from '../ImageGallery/ImageGallery';
import Button from '../Button/Button';
import Loader from '../Loader/Loader';
import Modal from '../Modal/Modal';
import './App.module.css';

export class App extends Component {
  state = {
    images: [],
    query: '',
    page: 1,
    isLoading: false,
    showModal: false,
    largeImageURL: '',
    showLoadMore: true,
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.page !== prevState.page || this.state.query !== prevState.query) {
      this.fetchImages();
    }
  }

  fetchImages = () => {
    const { query, page } = this.state;

    this.setState({ isLoading: true });

    fetchImages(query, page)
      .then(response => {
        if (response.data.hits.length === 0) {
          this.setState({ showLoadMore: false });
          return;
        }

        const { hits, totalHits } = response.data;
        const uniqueImages = this.removeDuplicates([...this.state.images, ...hits], 'id');

        this.setState(prev => ({
          images: uniqueImages,
          showLoadMore: prev.page < Math.ceil(totalHits / 12),
        }));
      })
      .catch(error => console.error('Error fetching images:', error))
      .finally(() => this.setState({ isLoading: false }));
  };

  removeDuplicates = (array, key) => {
    return array.filter((item, index, self) =>
      index === self.findIndex(t => t[key] === item[key])
    );
  };

  handleSearchSubmit = query => {
    this.setState({ query, page: 1, images: [], showLoadMore: true });
  };

  handleLoadMore = () => {
    this.setState(prevState => ({
      page: prevState.page + 1,
    }), () => {
      this.fetchImages();
    });
  };

  handleImageClick = largeImageURL => {
    this.setState({ showModal: true, largeImageURL });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false, largeImageURL: '' });
  };

  render() {
    const { images, isLoading, showModal, largeImageURL, showLoadMore } = this.state;

    return (
      <div className="App">
        <Searchbar onSubmit={this.handleSearchSubmit} />
        {images.length > 0 && (
          <ImageGallery images={images} onImageClick={this.handleImageClick} />
        )}
        {isLoading && <Loader />}
        {showLoadMore && images.length > 0 && !isLoading && (
          <Button onClick={this.handleLoadMore} />
        )}
        {showModal && (
          <Modal
            largeImageURL={largeImageURL}
            onClose={this.handleCloseModal}
          />
        )}
      </div>
    );
  }
}

export default App;
