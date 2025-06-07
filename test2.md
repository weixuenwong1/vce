> ⚠️ **Note:** This explanation is meant to support your understanding, but it is **not a substitute for your official textbook or prescribed course materials**. Always refer to your school resources for complete and accurate coverage of the syllabus.


# **Transformers and Power Distribution**

To wrap up our study of electricity generation, we now turn to how electricity is **delivered efficiently to homes and industries**. Once electrical energy is generated at power stations, it must travel long distances through **transmission lines**.

However, these lines have significant **resistance** and cover vast distances, leading to considerable **power losses**. This is where **transformers** play a critical role, they help **minimize energy loss.**


We'll also explore how **inverters** play a role in modern homes, especially where **solar panels** are used, converting **DC (Direct Current)** into **AC (Alternating Current)** to match the requirements of household appliances and the national grid.



## Transformers

![Magnetic Field Around 2 Magnets](https://vceproblems.s3.amazonaws.com/question_media/BasicTransformer.png)

The diagram above shows a basic setup of a transformer, where wires are wound around both sides of a laminated iron core:

- The **primary coil** is connected to the input voltage source.
- The **secondary coil** delivers the transformed voltage to the output.

We use subscripts:
- $ N_p, V_p, I_p $ for the **primary** side (turns, voltage, current)
- $ N_s, V_s, I_s $ for the **secondary** side

<br>

> 💡 **Note:** Transformers require an **AC power supply** to operate. This is because only a **changing current** can produce a **changing magnetic flux**, which is essential to induce an EMF in the secondary coil.  
> A **DC supply** won’t work, as it provides a constant current and therefore a constant flux, meaning **no induction occurs on the secondary side.**


---

## Transformer Equations
**Faraday’s Law** tells us that the induced EMF in each coil is proportional to the rate of change of magnetic flux and the number of turns:

$$\boldsymbol{V_p = N_p\frac{\Delta \Phi}{\Delta t} \quad \text{and} \quad V_s = N_s\frac{\Delta \Phi}{\Delta t}}$$

So:

$$\frac{V_p}{V_s} = \frac{N_p}{N_s} \quad \text{as both equations have the same} \; \frac{\Delta \Phi}{\Delta t} \; \text{ratio}$$
The number of turns is related to voltage by:

$$
    \boldsymbol{\frac{N_p}{N_s} = \frac{V_p}{V_s}}
$$

In Physics 3/4 we assume that **transformers are ideal** (no energy loss), **power in primary side is equal to power in secondary side:**

$$P_p = P_s \Rightarrow V_p I_p = V_s I_s$$

From this, we derive the current relationship:

$$
    \boldsymbol{\frac{N_p}{N_s} = \frac{I_s}{I_p}}
$$

<br>

### Step-Up vs Step-Down Transformers
If the number of turns on the **secondary coil** $N_s$ is greater than the number of turns on the **primary coil** $N_p$, the transformer is known as a **step-up transformer**, it increases the output voltage. Conversely, if $N_s < N_p$, it's a **step-down transformer**, which reduces the output voltage.

> ⚠️ **Note:** Since transformers conserve power, **increasing the voltage** results in a **decrease in current**, and vice versa. This inverse relationship helps **reduce energy losses during transmission**, a concept we’ll explore further later.


---

<br>

Let's consider the problem below.

<br>

**e.g 1. A 40 V RMS AC generator and an ideal transformer are used to supply power. Figure A below illustrates the generator and transformer delivering power to a 800 Ω resistor.**

![Transformer Problem 1](https://vceproblems.s3.amazonaws.com/question_media/Transformer1.1.png)


**a) Is this transformer a step-down or step-up transformer? (1 mark)**

***This is a step up transformer as the number of turns in the secondary side is more than on the primary side.***

---

<br>

**b) Determine the peak voltage at the secondary side of the transformer. Show your working. (2 marks)**

$$ \frac{N_p}{N_s} = \frac{V_p}{V_s} $$ 

$$ \frac{800}{8000} = \frac{40}{V_s} $$

$$ V_s = 40 \cdot \frac{8000}{800} $$

$$ V_s = 400 \; V_\text{RMS} $$

$$ \therefore \; V_\text{peak} = 400 \cdot \sqrt{2} $$ 

$$V_\text{peak} = 5.66 \times 10^2 \text{ V} $$

---

First, we use the relationship between the number of turns and voltage in a transformer. However, note that the voltage given on the primary side is **40 V RMS**.

To convert the RMS voltage to **peak voltage**, we use the formula: $V_{\text{peak}} = V_{\text{RMS}} \times \sqrt{2}$

---

<br>

**c) Calculate the power dissipated in the resistor. (2 marks)**

$$P = \frac{V^2}{R}$$

$$P = \frac{400^2}{800}$$

$$P = 200 \text{ W} $$

---

<br>

## Power Distribution

Voltage loss in electrical transmission lines can be calculated by:

$$
    \boldsymbol{V_{\text{loss}} = I R}
$$

Power loss can be calculated using any of the following equivalent formulas:

$$
    \boldsymbol{P_{\text{loss}} = \Delta V \cdot I = I^2 R = \frac{(\Delta V)^2}{R}}
$$

where:

- $ I $ is the current along the transmission lines  
- $ R $ is the resistance of the transmission wire  
- $ \Delta V $ is the voltage loss $ V_{\text{loss}}$ across the wire due to resistance  
- $ P $ is the power lost as heat in the transmission line



Among these, the formula, $P = I^2 R$ highlights a key insight: **power loss increases with the square of the current**. This means that even a small increase in current results in a significant increase in power loss.

<br>

---

### 🔌 Minimising Power Loss

To **minimise power loss**, we need to **reduce the current** flowing through the transmission lines. This is achieved using a **step-up transformer**, which:

- **Increases the voltage**
- **Decreases the current**

This is why **step-up transformers are placed before** electricity enters long-distance transmission lines. Then, near the point of use, a **step-down transformer** **reduces the voltage** to safe levels for homes and businesses.

> ⚠️ **Note:** While it might seem that increasing voltage increases power, that’s not the case here when looking at the formulas $P = \Delta V \cdot I = \frac{\Delta V^2}{R}$. $\Delta V$ actually represents the **voltage drop** ( $V_{\text{end}} - V_{\text{start}}$) across the transmission line, **not the voltage along the lines.**

---

<br>

Let's consider an example below.

<br>

**e.g 2. As part of their experimental practical investigation, a group of students are investigating how electricity is transmitted efficiently over long distances.**

**They set up a scaled-down model of a power transmission system to deliver power to a 20 V load. The system includes a generator that produces 200 V RMS, a step-up transformer with a turns ratio of 1:10, and a step-down transformer with a turns ratio of 10:1, ensuring the enough voltage is delivered to the 20 V load.**


![Transformer Problem](https://vceproblems.s3.amazonaws.com/question_media/Transformer3.4.png)


**a) Determine the current in the transmission lines if the generator's power output is 1.0 kW. Show your working. (2 marks)**

$$P = V I $$ \
$$I = \frac{P}{V} $$ \
$$I = \frac{1000}{200} $$ \
$$I = 5 $$

$$\frac{N_p}{N_s} = \frac{I_s}{I_p} $$ \
$$\frac{1}{10} = \frac{I_s}{5} $$ \
$$I_{\text{lines}} = 0.5 \; A $$


---


We first calculate the **current at the generator (primary side)**, then use the **turn ratio to find the current on the secondary side,** which is the current flowing through the transmission lines.


---

<br>

**b) Determine the power lost in the transmission lines if the total resistance across the lines is 8.0 𝝮. (2 marks)**

$$P_{\text{loss}} = I ^2 R $$

$$P_{\text{loss}} = (0.5) ^2 \cdot 8.0 $$

$$P_{\text{loss}} = 2.0 \; W $$


---

Here, we simply apply the $P = I^2 R$ formula, using the current flowing through the transmission lines and the total resistance.

---

<br>

**c) Where has the lost power gone? (1 mark)**

***It is lost as heat in the transmission lines due to resistance.***

---

<br>

**d) If the turn ratios of the transformers were changed to 1:20 for the step-up transformer and 20:1 for the step-down transformer, would the power loss in the transmission lines increase or decrease and by what factor? (2 marks)**

***If the transformer turns ratio increases to a ratio of 1:20, the current in the transmission lines would be halved. Since power loss is given by $P = I^2R$, this would reduce the power loss in the lines by a factor of 4.***

---

Doubling the turns ratio from **1:10 to 1:20** doubles the voltage and halves the current in the transmission lines.

Using $P_{\text{loss}} = \left(\frac{I}{2}\right)^2 R = \frac{1}{4} I^2 R$.

**Power loss is reduced by a factor of 4.**

---


## ☀️ **Photovoltaic Cells and Inverters**

**Photovoltaic (PV) cells**, commonly found in **solar panels**, convert **sunlight directly into DC (Direct Current) electricity** using the **photoelectric effect (discussed further in Unit 4).** However, most appliances and the national grid operate on **AC (Alternating Current)**.

This is where **inverters** come in — they **convert the DC output from solar panels into AC,** making it usable for household devices or allowing it to be fed back into the power grid.

---

## **Conclusion: Transformers and Power Distribution**

In this chapter, we explored how electricity generated at power stations is transmitted efficiently across long distances to reach homes and industries. 

- **Transformers** are essential for adjusting voltage and current levels, enabling efficient power transmission.
- **Step-up transformers** increase voltage and reduce current, significantly minimizing **power loss** over transmission lines.
- **Step-down transformers** bring voltage back down to safe and usable levels for household and industrial applications.
- Power loss in transmission lines is primarily caused by resistance and is proportional to the **square of the current** (\( P = I^2 R \)).
- Inverters are used in homes — particularly in systems with **solar panels** — to convert **DC to AC**, making the electricity compatible with the grid and appliances.

