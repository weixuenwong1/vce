> ⚠️ **Note:** This explanation is meant to support your understanding, but it is **not a substitute for your official textbook or prescribed course materials**. Always refer to your school resources for complete and accurate coverage of the syllabus.


# **Magnetic Fields (Applications)**


In exploring **magnetic fields**, we now look at their practical applications — such as how magnetic fields drive devices like **DC motors** or control the motion of **charged particles** in tools like the **mass spectrometer.**




## DC Motor

DC Motors are devices that transform **electrical energy** (power supply) into **rotational kinetic energy** (rotation of the coil). They are widely used in various tools and devices including electric toothbrushes, electric screwdrivers and drills, robotics and automation systems.

![Right hand grip rule problem](https://vceproblems.s3.amazonaws.com/question_media/DCMotor.png)


In the image above, a coil is placed inside a **magnetic field** and a **current (from a power supply) flows in an anticlockwise direction**.

Using the **Right-Hand Slap Rule**:

- The **magnetic field** is directed from **left to right** (North to South).
- The **current** flows from **J to M**, so your **palm faces downward**.
- This means:
  - The **force on side JM is downward**.
  - The **force on side KL is upward**.

---

### 🛑 The Problem Without a Commutator

After rotating **90°**, the coil becomes vertical (as shown on the right side of the image). If the current remains unchanged, the direction of the forces will reverse, causing the coil to:

- Rotate **back to its original position**.
- Result in a **back-and-forth motion**, not continuous rotation.

---

#### 🔄 Solution: Split-Ring Commutator

To fix this, a **split-ring commutator** is used. It:

- **Reverses the direction of the current** every **half turn**.
- This reversal keeps the **forces on the coil in the same direction**.
- Ensures that the **torque and rotation remain continuous** in **one direction**.

---

### ⚙️ Quantifying Force and Torque in a DC Motor

We’ve seen how to determine the **direction of rotation** using the **Right-Hand Slap Rule**. But to **quantify** the actual **force** and **torque**, we use the following formulas:

$$
   \boldsymbol{F = nILB}
$$

and

$$
   \boldsymbol{\tau = rF}
$$

Or, for a rectangular coil:

$$
   \boldsymbol{\tau = (F_{JM} \cdot \frac{JK}{2}) \cdot 2}
$$

Where:
- $ F_{JM} $ = Force on side JM of the coil
- $ JK $ = Width of the coil
- The factor of 2 accounts for the force on both sides of the coil

---

<br>

Let's consider the problem below.

<br>

**e.g 1. As shown in Figure A below, a coil of 40 turns is positioned to rotate about a horizontal axis with little friction. The coil is connected to a DC supply, enabling the flow of current and causing the coil to rotate based on electromagnetic forces.**


![DC Motor Problem](https://vceproblems.s3.amazonaws.com/question_media/DCMotor13.png)


**a) Determine whether the coil will rotate in a clockwise or anticlockwise direction as viewed from the side of the split-ring commutator. Give your reasoning. (2 marks)**

***The direction of rotation will be anticlockwise, considering side JM, the magnetic field direction is to the right and the direction of current is from M to J through side JM, hence the force on JM is down using right hand slap rule and the direction of rotation is anticlockwise.***


---

The **direction of force** must always be determined using the **Right-Hand Slap Rule**.  
The key point to remember is that **current flows from the positive terminal** of the power supply. In this case, the current flows from **M → J → K → L**.

---

<br>

**b) If the magnitude of the force on side JM is 25 N, determine the strength of the magnetic field B. Show your working. (2 marks)**

$$ F = n I L B $$

$$ 25 = 40 \cdot 1.5 \cdot 0.50 \cdot B $$

$$ B = \frac{25}{ 40 \cdot 1.5 \cdot 0.50} $$

$$ B = 0.83 \; T $$

---

We apply the **magnetic force equation for a current-carrying wire** and solve for the unknown magnetic field strength $B$.

---

<br>

**c) Provide two methods by which the force acting on side KL can be increased. (2 marks)**

***The force on side KL can be increased by increasing the number of turns or increasing the magnetic field strength.***

---

Increasing any variable in the equation $F = nILB$ will result in a greater magnetic force.  
Also, **increasing the voltage** of the power supply will **increase the current**, which in turn increases the force.

---

>## Controlling Motion of Charged Particles
>A charged particle entering a uniform magnetic field experiences a force $F = qvB$, always **perpendicular to its motion** (by right hand-slap rule). This acts as a **centripetal force,** so equating $F = qvB$ and $F = \frac{mv^2}{r} $, we get the **radius of its circular path:**
>$$
>   \boldsymbol{r = \frac{mv}{qB}}
>$$

---

<br>

Let's consider an example that considers both electric and magnetic fields.

<br>

**e.g 2. An electron enters a magnetic field directed out of the page, positioned between parallel plates, as shown in Figure A. The plates are spaced 5.0 × 10⁻³ m apart, with a potential difference of V₀ = 1.0 kV applied across them.**

**In the first experiment, the switch remains open and no electric field is present. Use the mass of the electron as 9.11 × 10⁻³¹ kg and charge of the electron as 1.6 × 10⁻¹⁹C.**

![Magnetic and Electric Field Problem](https://vceproblems.s3.amazonaws.com/question_media/MEfield1.6.png)

**a) Describe the motion of the electron as it enters the magnetic field and determine the radius of its path if it enters the magnetic field at a speed of 2.5 × 10⁶ m s⁻¹. Use B = 9.0 mT. (3 marks)**


***The electron would be deflected upwards and would travel in a circular path.***

$$r = \frac{mv}{qB} $$ 

$$r = \frac{(9.11 \cdot 10^{-31}) \times (2.5 \cdot 10^6)}{(1.6 \cdot 10^{-19}) \times (9.0 \cdot 10^{-3})} $$

$$r = 1.6 \times 10^{-3} \; m $$

---

To determine the direction in which the electron travels, we use the **right-hand slap rule**.  
- **Thumb** points to the **left** (opposite to electron’s velocity).  
- **Fingers** point **out of the page.**   
- The **palm** then faces **upwards**

To determine the radius of its path we just use $r = \frac{mv}{qB} $

---

![Magnetic and Electric Field Problem](https://vceproblems.s3.amazonaws.com/question_media/MEfield1.6B.png)


**b) In the second experiment, the electron enters a different magnetic field with the switch closed but at the same speed, allowing an electric field to be present between the parallel plates.**

**Determine the magnitude of the magnetic field so that the electron's path remains undeflected. Assume that the distance between the plates and the potential difference is the same as in part. (3 marks)**

$qvB = qE \; $ ***, if the electron remains undeflected, magnetic force down = electric force up***
$$vB = E $$

$$2.5 \times 10^6 \times B = \frac{1.0\times 10^3}{5 \times 10^{-3}} $$

$$B = 8.0 \times 10^{-2} \; T $$

---

The **top plate is positively charged** as it’s connected to the positive terminal of the power supply, so the **electric force** on the electron is **upwards**. The **magnetic field** is directed **into the page**, so using the **right-hand slap rule**, the **magnetic force** on the electron is **downwards**.

For the electron to remain **undeflected**, the forces must **balance**:  
$$
qE = qvB
$$

---


## Conclusion for Magnetic Fields (Applications)

- In a **DC motor**, magnetic fields interact with current-carrying conductors to produce a **rotational force (torque)**. This force arises due to the **magnetic force** on the wire segments, determined using the **Right-Hand Slap Rule**.

- The **commutator** in a DC motor ensures the current direction reverses every half-turn, maintaining **continuous rotation** in one direction.

- For **charged particles**, magnetic fields can be used to **control motion**. The force $$ F = qvB $$ is always **perpendicular** to velocity, resulting in **circular motion**