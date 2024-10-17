import matplotlib
import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter
import numpy as np
import io


def control_chart_img_buffer_plotly(df, x, y, goal, title="Control Chart"):
    import plotly.express as px
    import plotly.graph_objs as go
    import numpy as np

    mean = df[y].mean()
    std_dev = df[y].std()
    UCL = mean + 3 * std_dev
    LCL = mean - 3 * std_dev

    # Creating the plot
    fig = go.Figure()

    # Adding data points
    fig.add_trace(
        go.Scatter(
            x=df[x],
            y=df[y],
            mode="lines+markers",
            name=y,
            line=dict(color="blue"),
            marker=dict(size=8),
        )
    )

    # Goal
    fig.add_trace(
        go.Scatter(
            x=df[x],
            y=[goal] * len(df),
            mode="lines",
            name="Goal",
            line=dict(color="yellow", dash="dash"),
        )
    )

    # Adding center line (mean)
    fig.add_trace(
        go.Scatter(
            x=df[x],
            y=[mean] * len(df),
            mode="lines",
            name="Mean",
            line=dict(color="green", dash="dash"),
        )
    )

    # Adding Upper Control Limit (UCL)
    fig.add_trace(
        go.Scatter(
            x=df[x],
            y=[UCL] * len(df),
            mode="lines",
            name="Upper Control Limit (UCL)",
            line=dict(color="red", dash="dash"),
        )
    )

    # Adding Lower Control Limit (LCL)
    fig.add_trace(
        go.Scatter(
            x=df[x],
            y=[LCL] * len(df),
            mode="lines",
            name="Lower Control Limit (LCL)",
            line=dict(color="red", dash="dash"),
        )
    )

    z = np.polyfit(df.index, df[y], 1)
    p = np.poly1d(z)
    df["trendline"] = p(df.index)

    fig.add_trace(
        go.Scatter(
            x=df[x],  # Use the same x-axis (df.index)
            y=df["trendline"],
            mode="lines",
            name="Trendline",
            line=dict(color="purple", dash="dash"),
        )
    )

    # Updating layout for better visualization
    fig.update_layout(
        title=title,
        xaxis_title=y,
        yaxis_title=x,
        showlegend=True,
        width=1600,
        height=600,
    )

    return fig.to_image(format="svg")


def control_chart_img_buffer(df, x, y, goal=None, title="Control Chart"):
    matplotlib.use("Agg")

    df["Goal"] = goal
    df["Mean"] = df[y].mean()
    df["Upper Control Limit"] = df[y].mean() + df[y].std()
    df["Lower Control Limit"] = df[y].mean() - df[y].std()

    plt.figure(figsize=(12, 6))

    plt.plot(df[x], df[y], marker="x", linestyle="-", color="r", label=y)

    z = np.polyfit(df.index, df[y], 1)
    p = np.poly1d(z)

    plt.plot(df[x], p(df.index), linestyle="--", color="blue", label="Trendline")

    if goal is not None:
        plt.plot(df[x], df["Goal"], marker="x", linestyle="-", color="g", label="Goal")

    plt.plot(df[x], df["Mean"], marker="x", linestyle="-", color="orange", label="Mean")

    plt.plot(
        df[x],
        df["Upper Control Limit"],
        marker="x",
        linestyle="-",
        color="y",
        label="Upper Control Limit",
    )

    plt.plot(
        df[x],
        df["Lower Control Limit"],
        marker="x",
        linestyle="-",
        color="y",
        label="Lower Control Limit",
    )

    plt.title(title)
    plt.xlabel(x)
    plt.ylabel(y)
    plt.legend()
    plt.grid(False)
    plt.xticks(rotation=45)
    plt.tight_layout()

    buffer = io.BytesIO()
    plt.savefig(buffer, format="png")
    plt.close()  # Close the plot to free up memory
    buffer.seek(0)

    return buffer


def control_chart(df, x, y, goal=None, title="Control Chart"):
    df["Goal"] = goal
    df["Mean"] = df[y].mean()
    df["Upper Control Limit"] = df[y].mean() + df[y].std()
    df["Lower Control Limit"] = df[y].mean() - df[y].std()

    plt.figure(figsize=(12, 6))

    plt.plot(df[x], df[y], marker="x", linestyle="-", color="r", label=y)

    z = np.polyfit(df.index, df[y], 1)
    p = np.poly1d(z)

    plt.plot(df[x], p(df.index), linestyle="--", color="blue", label="Trendline")

    if goal is not None:
        plt.plot(df[x], df["Goal"], marker="x", linestyle="-", color="g", label="Goal")

    plt.plot(df[x], df["Mean"], marker="x", linestyle="-", color="orange", label="Mean")

    plt.plot(
        df[x],
        df["Upper Control Limit"],
        marker="x",
        linestyle="-",
        color="y",
        label="Upper Control Limit",
    )

    plt.plot(
        df[x],
        df["Lower Control Limit"],
        marker="x",
        linestyle="-",
        color="y",
        label="Lower Control Limit",
    )

    plt.title(title)
    plt.xlabel(x)
    plt.ylabel(y)
    plt.legend()
    plt.grid(False)
    plt.xticks(rotation=45)
    plt.tight_layout()

    plt.show()


def pareto_chart(data, x, y, hue=None, palette="viridis"):
    fig, ax = plt.subplots()
    cumsum = data[y].cumsum()
    ax.bar(data[x], data[y], color="C0")
    ax2 = ax.twinx()
    ax2.plot(data[x], cumsum, color="C1", marker="D", ms=7)
    ax2.yaxis.set_major_formatter(PercentFormatter())
    ax.tick_params(axis="y", colors="C0")
    ax2.tick_params(axis="y", colors="C1")

    for tick in ax.get_xticklabels():
        tick.set_rotation(90)

    plt.show()
