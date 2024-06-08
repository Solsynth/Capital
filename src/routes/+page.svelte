<div class="container px-12 mx-auto">
	<div class="landing-slide">
		<div class="landing-slide-first">
			<div
				class="aspect-square w-[128px] bg-neutral rounded-xl mb-6 ml-[-4px] flex justify-center items-center"
			>
				<enhanced:img src="../assets/solar.svg" alt="Studio Avatar" class="w-[90px] h-[96px] block" />
			</div>

			<h2 class="text-2xl">Hi, there!</h2>
			<h1 class="text-6xl font-bold">We're Solsynth</h1>

			<section class="mt-8 text-lg">
				<p>
					We're the world youngest Software <strike>Company</strike> Studio who
					make the software that everyone love.
				</p>
			</section>
		</div>

		<div class="landing-slide-second">
			<div class="card w-full md:w-5/6 bg-base-100 shadow-xl">
				<div class="card-body pb-0">
					<h2 class="card-title">Products!</h2>
					<p>Take a look of all our lovely products!</p>
				</div>
				<div class="divider"></div>
				<div class="card-body pt-0 grid grid-cols-4">
					<a href="/products/solar-network">
						<enhanced:img
							src="../assets/solian.png"
							alt="Solar Network"
							class="min-w-[64px] min-h-[64px] w-[64px] h-[64px] aspect-square block"
						/>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
    .landing-slide {
        gap: 1rem;
        height: 40rem;
        display: grid;
        align-items: center;
        grid-template-columns: 1fr;
    }

    @media (min-width: 720px) {
        .landing-slide {
            grid-template-columns: 1fr 1fr;
        }

        .landing-slide-second {
            display: flex;
            justify-content: end;
        }
    }
</style>
