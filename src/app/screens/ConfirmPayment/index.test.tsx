import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import lightningPayReq from "bolt11";
import { MemoryRouter } from "react-router-dom";
import { settingsFixture as mockSettings } from "~/../tests/fixtures/settings";
import * as SettingsContext from "~/app/context/SettingsContext";
import type { OriginData } from "~/types";

import ConfirmPayment from "./index";

jest.spyOn(SettingsContext, "useSettings").mockReturnValue({
  settings: mockSettings,
  isLoading: false,
  updateSetting: jest.fn(),
});

jest.mock("~/common/utils/currencyConvert", () => {
  return {
    getFiatValue: jest.fn(() => "€12,345.67"),
  };
});

const mockOrigin: OriginData = {
  location: "https://getalby.com/demo",
  domain: "https://getalby.com",
  host: "getalby.com",
  pathname: "/demo",
  name: "Alby",
  description: "",
  icon: "https://getalby.com/assets/alby-503261fa1b83c396b7ba8d927db7072d15fea5a84d387a654c5d0a2cefd44604.svg",
  metaData: {
    title: "Alby Demo",
    url: "https://getalby.com/demo",
    provider: "Alby",
    image:
      "https://getalby.com/assets/alby-503261fa1b83c396b7ba8d927db7072d15fea5a84d387a654c5d0a2cefd44604.svg",
    icon: "https://getalby.com/favicon.ico",
  },
  external: true,
};

const paymentRequest =
  "lnbc250n1p3qzycupp58uc2wa29470f98wrxmy4xwuqt8cywjygf5t2cp0s376y7nwdyq3sdqhf35kw6r5de5kueeqg3jk6mccqzpgxqyz5vqsp5wfdmwtv5rmru00ajsnn3f8lzpxa4snug2tmqvc8zj8semr4kjjts9qyyssq83h74pte8nrkqs8sr2hscv5zcdmhwunwnd6xr3mskeayh96pu7ksswa6p7trknlpp6t3js4k6uytxutv5ecgcwaxz7fj4zfy5khjcjcpf66muy";

jest.mock("~/app/hooks/useNavigationState", () => {
  return {
    useNavigationState: jest.fn(() => ({
      origin: mockOrigin,
      args: {
        paymentRequest,
      },
    })),
  };
});

describe("ConfirmPayment", () => {
  test("render", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <ConfirmPayment />
        </MemoryRouter>
      );
    });

    expect(
      await screen.findByText("Remember and set a budget")
    ).toBeInTheDocument();
  });

  test("toggles set budget, displays input with a default budget", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <MemoryRouter>
          <ConfirmPayment />
        </MemoryRouter>
      );
    });

    await act(() => {
      user.click(screen.getByText("Remember and set a budget"));
    });

    const input = await screen.findByLabelText("Budget");
    const satoshis = lightningPayReq.decode(paymentRequest).satoshis || 0;
    expect(input).toHaveValue(satoshis * 10);
  });
});
