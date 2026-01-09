import React from 'react';
import styled from 'styled-components';

const StarRating = styled.div`
  display: flex;

  .bh-star {
    width: 1.2rem;
    height: 1.2rem;

    .outline {
      fill: #F0A44F;
    }

    .full,
    .left-half {
      fill: transparent;
    }
  }

  // fill in full stars
  ${[1, 2, 3, 4, 5].map(
    (i) => `
      &[data-bh-rating^="${i}"] .bh-star--1 .full { fill: #F0A44F; }
    `
  )}

  ${[2, 3, 4, 5].map(
    (i) => `
      &[data-bh-rating^="${i}"] .bh-star--2 .full { fill: #F0A44F; }
    `
  )}

  ${[3, 4, 5].map(
    (i) => `
      &[data-bh-rating^="${i}"] .bh-star--3 .full { fill: #F0A44F; }
    `
  )}

  ${[4, 5].map(
    (i) => `
      &[data-bh-rating^="${i}"] .bh-star--4 .full { fill: #F0A44F; }
    `
  )}

  &[data-bh-rating^="5"] .bh-star--5 .full {
    fill: #F0A44F;
  }

  // fill in half stars
  ${[5, 6, 7, 8, 9].map(
    (i) => `
      &[data-bh-rating^="0.${i}"] .bh-star--1 .left-half { fill: #F0A44F; }
      &[data-bh-rating^="1.${i}"] .bh-star--2 .left-half { fill: #F0A44F; }
      &[data-bh-rating^="2.${i}"] .bh-star--3 .left-half { fill: #F0A44F; }
      &[data-bh-rating^="3.${i}"] .bh-star--4 .left-half { fill: #F0A44F; }
      &[data-bh-rating^="4.${i}"] .bh-star--5 .left-half { fill: #F0A44F; }
    `
  )}

  &.rounding-up {
    // fill in full stars
    ${[1, 2, 3, 4, 5].map(
      (i) => `
        &[data-bh-rating^="${i}"] .bh-star--1 .full { fill: #F0A44F; }
      `
    )}

    ${[2, 3, 4, 5].map(
      (i) => `
        &[data-bh-rating^="${i}"] .bh-star--2 .full { fill: #F0A44F; }
      `
    )}

    ${[3, 4, 5].map(
      (i) => `
        &[data-bh-rating^="${i}"] .bh-star--3 .full { fill: #F0A44F; }
      `
    )}

    ${[4, 5].map(
      (i) => `
        &[data-bh-rating^="${i}"] .bh-star--4 .full { fill: #F0A44F; }
      `
    )}

    &[data-bh-rating^="5"] .bh-star--5 .full {
      fill: #F0A44F;
    }

    ${[6, 7, 8, 9].map(
      (i) => `
        &[data-bh-rating^="0.${i}"] .bh-star--1 .full { fill: #F0A44F; }
        &[data-bh-rating^="1.${i}"] .bh-star--2 .full { fill: #F0A44F; }
        &[data-bh-rating^="2.${i}"] .bh-star--3 .full { fill: #F0A44F; }
        &[data-bh-rating^="3.${i}"] .bh-star--4 .full { fill: #F0A44F; }
        &[data-bh-rating^="4.${i}"] .bh-star--5 .full { fill: #F0A44F; }
      `
    )}

    // fill in half stars
    ${[0, 1, 2, 3, 4, 5].map(
      (i) => `
        &[data-bh-rating^="0.${i}"] .bh-star--1 .left-half { fill: #F0A44F; }
        &[data-bh-rating^="1.${i}"] .bh-star--2 .left-half { fill: #F0A44F; }
        &[data-bh-rating^="2.${i}"] .bh-star--3 .left-half { fill: #F0A44F; }
        &[data-bh-rating^="3.${i}"] .bh-star--4 .left-half { fill: #F0A44F; }
        &[data-bh-rating^="4.${i}"] .bh-star--5 .left-half { fill: #F0A44F; }
      `
    )}
  }
`;

const Star = ({ className, children }) => (
  <svg version="1.1" className={className} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" xmlSpace="preserve">
    <path className="outline" d="M12,4.2L14.5,9l0.2,0.5l0.5,0.1l5.5,0.8L16.8,14l-0.4,0.4l0.1,0.5l1,5.3l-5-2.5L12,17.5l-0.4,0.2l-5,2.5L7.5,15l0.1-0.5L7.2,14l-4-3.7l5.5-0.8l0.5-0.1L9.5,9L12,4.2 M11.9,2L8.6,8.6L1,9.7l5.5,5.1L5.2,22l6.8-3.4l6.8,3.4l-1.3-7.2L23,9.6l-7.6-1L11.9,2L11.9,2z" />
    <polygon className="full" points="18.8,22 12,18.6 5.2,22 6.5,14.8 1,9.7 8.6,8.6 11.9,2 15.4,8.6 23,9.6 17.5,14.7" />
    <polyline className="left-half" points="12,18.6 5.2,22 6.5,14.8 1,9.7 8.6,8.6 11.9,2" />
  </svg>
);

const Rating = ({ rating }) => (
  <StarRating data-bh-rating={rating}>
    {[1, 2, 3, 4, 5].map((index) => (
      <Star key={index} className={`bh-star bh-star--${index}`}  />
    ))}
  </StarRating>
);

export default Rating;
