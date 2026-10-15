import { css } from "lit";

export const profileLayoutStyles = css`
  .profile-identity {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    min-height: 104px;
    padding: 16px 0 28px;
  }
  .identity-copy {
    flex: 1 1 180px;
    min-width: 0;
  }
  .profile-image-row {
    border-top: 1px solid var(--tacta-color-border, #ffffff0d);
    padding: 20px 0;
  }
  .trailing {
    margin-left: auto;
  }
  @media (max-width: 650px) {
    .profile-identity {
      padding: 16px 0 24px;
      gap: 12px;
    }
    .identity-copy {
      flex-basis: 140px;
    }
    .trailing {
      margin-left: 0;
    }
  }
`;
